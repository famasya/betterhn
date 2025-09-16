import {
	AppleStocksIcon,
	Comment01Icon,
	Time04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import DOMPurify from "dompurify";
import Comments from "~/components/comments";
import { PostDetailSkeleton } from "~/components/skeletons/post-detail-skeleton";
import { type CommentItem, loadComments } from "~/functions/load-comments";
import { createQueryClient } from "~/lib/query-client";
import { firebaseFetcher } from "../lib/fetcher";
import type { FirebasePostDetail } from "../lib/types";

export const Route = createFileRoute("/_app/$category/{-$postId}")({
	loader: ({ params: { postId } }) => {
		const queryClient = createQueryClient();
		return queryClient.ensureQueryData({
			queryKey: ["post", postId],
			queryFn: async () => {
				const postIdNum = postId?.split("-").pop();
				const post = await firebaseFetcher
					.get<FirebasePostDetail>(`item/${postIdNum}.json`)
					.json();

				let initialComments: CommentItem[] = [];
				const remainingCommentSlices: number[][] = [];

				if (!post) {
					throw notFound();
				}

				if (post.kids && post.kids.length > 0) {
					// Load only first 10 comments server-side for SEO and initial load performance
					const initialCommentIds = post.kids.slice(0, 10);
					const remainingCommentIds = post.kids.slice(10);

					// Create slices of 10 for remaining comments
					for (let i = 0; i < remainingCommentIds.length; i += 10) {
						remainingCommentSlices.push(remainingCommentIds.slice(i, i + 10));
					}

					// Load initial comments server-side
					if (initialCommentIds.length > 0) {
						try {
							const commentsResult = await loadComments({
								data: initialCommentIds,
							});
							initialComments = commentsResult.comments;
						} catch (error) {
							console.warn("Failed to load initial comments:", error);
						}
					}
				}

				return {
					post,
					initialComments,
					remainingCommentSlices,
				};
			},
		});
	},
	component: RouteComponent,
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData?.post?.title || "Post",
			},
		],
	}),
	pendingComponent: () => <PostDetailSkeleton />,
});

function RouteComponent() {
	const { post, initialComments, remainingCommentSlices } =
		Route.useLoaderData();

	// Debug: Check if dark class is applied (client-side only)
	if (typeof window !== "undefined") {
		console.log(
			"Document classes:",
			document.documentElement.classList.toString()
		);
	}

	return (
		<div
			className="h-[100dvh] flex-1 overflow-y-auto bg-gray-50 pb-14 md:pb-0 dark:bg-gray-900"
			id="post-content"
		>
			{/* Post Header */}
			<div className="border-gray-200 border-b bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
				<h1
					className="mb-3 hyphens-auto break-words font-medium text-gray-900 text-lg sm:text-xl dark:text-gray-100"
					style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
				>
					{post.title}
				</h1>
				<div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm sm:gap-4 dark:text-gray-400">
					<span>
						by <span className="font-medium">{post.by}</span>
					</span>
					<div className="flex items-center gap-1">
						<HugeiconsIcon icon={Time04Icon} size={16} />
						{formatRelative(post.time * 1000, Date.now())}
					</div>
					<div className="flex items-center gap-1">
						<HugeiconsIcon icon={AppleStocksIcon} size={16} />
						{post.score} points
					</div>
					{post.descendants > 0 && (
						<div className="flex items-center gap-1">
							<HugeiconsIcon icon={Comment01Icon} size={16} />
							{post.descendants} comments
						</div>
					)}
				</div>
				{post.url && (
					<div className="mt-3">
						<Link
							className="text-orange-600 text-sm hover:text-orange-700"
							rel="noopener noreferrer"
							target="_blank"
							to={post.url}
						>
							{(() => {
								try {
									return new URL(post.url).hostname;
								} catch {
									return post.url;
								}
							})()}
						</Link>
					</div>
				)}

				{post.text && (
					<div className="mt-4 border-gray-200 border-t border-dashed pt-4 dark:border-gray-700">
						<div
							className="overflow-hidden hyphens-auto break-words text-gray-800 text-sm leading-relaxed dark:text-gray-200 [&_*]:hyphens-auto [&_*]:break-words [&_*]:text-gray-800 [&_*]:dark:text-gray-200 [&_a]:text-orange-600 [&_a]:underline [&_a]:hover:text-orange-700 [&_code]:break-normal [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-gray-800 [&_p:last-child]:mb-0 [&_p]:mb-3 [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:break-normal [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:dark:bg-gray-800"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: ignored
							dangerouslySetInnerHTML={{
								__html:
									typeof window !== "undefined"
										? DOMPurify.sanitize(post.text, {
												USE_PROFILES: { html: true },
												ADD_ATTR: ["target"],
												ALLOWED_ATTR: ["href", "target", "rel"],
											})
										: post.text, // Server-side: use original text, sanitize on client
							}}
							style={{
								color:
									typeof window !== "undefined" &&
									document.documentElement.classList.contains("dark")
										? "#e5e7eb"
										: "#1f2937",
								wordBreak: "break-word",
								overflowWrap: "anywhere",
							}}
						/>
					</div>
				)}
			</div>

			{/* Comments Section */}
			<Comments
				initialComments={initialComments}
				postId={post.id}
				remainingCommentSlices={remainingCommentSlices}
				totalComments={post.descendants}
			/>
		</div>
	);
}

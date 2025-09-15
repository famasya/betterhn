import {
	AppleStocksIcon,
	Comment01Icon,
	Time04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import Comments from "~/components/comments";
import { ScrollArea } from "~/components/ui/scroll-area";
import { type CommentItem, loadComments } from "~/functions/load-comments";
import { firebaseFetcher } from "../lib/fetcher";
import type { FirebasePostDetail } from "../lib/types";

export const Route = createFileRoute("/_app/$category/$postId")({
	loader: async ({ params: { postId, category } }) => {
		const postIdNum = postId.split("-").pop();
		const post = await firebaseFetcher
			.get<FirebasePostDetail>(`item/${postIdNum}.json`)
			.json()

		let initialComments: CommentItem[] = [];
		const remainingCommentSlices: number[][] = [];

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
					})
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
		}
	},
	component: RouteComponent,
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData?.post?.title || "Post",
			},
		],
	}),
	pendingComponent: () => (
		<div className="flex h-64 items-center justify-center">Loading post...</div>
	),
});

function RouteComponent() {
	const { post, initialComments, remainingCommentSlices } =
		Route.useLoaderData();

	return (
		<ScrollArea className="h-screen bg-gray-50" id="post-content">
			{/* Post Header */}
			<div className="border-gray-200 border-b bg-white p-4 sm:p-6">
				<h1
					className="mb-3 hyphens-auto break-words font-medium text-gray-900 text-lg sm:text-xl"
					style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
				>
					{post.title}
				</h1>
				<div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm sm:gap-4">
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
							{new URL(post.url).hostname}
						</Link>
					</div>
				)}

				{post.text && (
					<div className="mt-4 border-gray-200 border-t border-dashed pt-4">
						<div
							className="overflow-hidden hyphens-auto break-words text-gray-800 text-sm leading-relaxed [&_*]:hyphens-auto [&_*]:break-words [&_a]:text-orange-600 [&_a]:underline [&_a]:hover:text-orange-700 [&_code]:break-all [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:font-mono [&_code]:text-xs [&_p:last-child]:mb-0 [&_p]:mb-3 [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:break-all [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: contentis in html
							dangerouslySetInnerHTML={{ __html: post.text }}
							style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
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
		</ScrollArea>
	)
}

import {
	AnalyticsUpIcon,
	Comment01Icon,
	LinkSquare02Icon,
	Time04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import DOMPurify from "dompurify";
import Comments from "~/components/comments";
import SearchButton from "~/components/search-button";
import { PostDetailSkeleton } from "~/components/skeletons/post-detail-skeleton";
import { Button } from "~/components/ui/button";
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
					.get(`item/${postIdNum}.json`)
					.json<FirebasePostDetail>();

				if (!post) {
					throw notFound();
				}

				return {
					post,
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
	const { post } = Route.useLoaderData();

	return (
		<div
			className="h-[100dvh] flex-1 overflow-y-auto bg-zinc-50 pb-14 md:pb-0 dark:bg-black"
			id="post-content"
		>
			{/* Post Header */}
			<div className="mb-4 border-gray-200 border-b bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mb-3 flex items-center justify-between gap-2">
					<h1
						className="hyphens-auto break-words font-medium text-gray-900 text-lg sm:text-xl dark:text-white"
						style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
					>
						{post.title}
					</h1>
					<div className="flex items-center gap-2 md:flex-row">
						<SearchButton />
						<a
							href={`https://news.ycombinator.com/item?id=${post.id}`}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Button
								className="flex items-center gap-2 text-xs"
								size={"sm"}
								variant={"outline"}
							>
								<HugeiconsIcon icon={LinkSquare02Icon} size={16} />
								OP
							</Button>
						</a>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm sm:gap-4 dark:text-zinc-400">
					<span>
						by <span className="font-medium">{post.by}</span>
					</span>
					<div className="flex items-center gap-1">
						<HugeiconsIcon icon={Time04Icon} size={16} />
						{formatRelative(post.time * 1000, Date.now())}
					</div>
					<div className="flex items-center gap-1">
						<HugeiconsIcon icon={AnalyticsUpIcon} size={16} />
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
						<a
							className="flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-100/40 px-2 py-1 text-emerald-600 text-sm hover:text-emerald-700 dark:border-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-200 dark:hover:text-emerald-300"
							href={post.url}
							rel="noopener noreferrer"
							target="_blank"
						>
							{/* truncate url */}
							{(() => {
								try {
									return new URL(post.url).hostname;
								} catch {
									return post.url;
								}
							})()}
							<HugeiconsIcon icon={LinkSquare02Icon} size={16} />
						</a>
					</div>
				)}

				{post.text && (
					<div className="mt-4 border-gray-200 border-t border-dashed pt-4 dark:border-zinc-800">
						<div
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
							id="post-description"
						/>
					</div>
				)}
			</div>

			{/* Comments Section */}
			<Comments
				commentIds={post.kids}
				initialComments={[]}
				postId={post.id}
				remainingCommentSlices={[]}
				totalComments={post.descendants}
			/>
		</div>
	);
}

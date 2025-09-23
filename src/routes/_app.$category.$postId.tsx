import {
	AnalyticsUpIcon,
	Comment01Icon,
	LinkSquare02Icon,
	Loading03Icon,
	Time04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import DOMPurify from "isomorphic-dompurify";
import Comments from "~/components/comments";
import { NotFound } from "~/components/not-found";
import { Button } from "~/components/ui/button";
import { type CommentItem, loadComments } from "~/functions/load-comments";
import { fetchPost } from "../lib/fetch-posts";
import type { FirebasePostDetail } from "../lib/types";

export const Route = createFileRoute("/_app/$category/$postId")({
	loader: async ({
		params: { postId, category },
		context: { queryClient },
		preload,
		abortController,
	}) => {
		const content = await queryClient.ensureQueryData({
			queryKey: ["post", postId],
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
			queryFn: async () => {
				const postIdNum = Number(postId?.split("-").pop());
				if (!postIdNum) {
					throw notFound();
				}

				const post = await fetchPost(postIdNum);

				// if preload, also fetch comments
				const kids = post.kids || [];
				const comments: CommentItem[] = [];
				const remainingCommentSlices: number[][] = [];
				if (preload && kids.length > 0) {
					// get first 10 comments
					const { comments: preloadComments } = await loadComments({
						data: kids.slice(0, 10),
						signal: abortController.signal,
					});
					queryClient.setQueryData(["comments", postId], preloadComments);
					comments.push(...preloadComments);

					// remaining comments
					for (let i = 10; i < kids.length; i += 10) {
						remainingCommentSlices.push(kids.slice(i, i + 10));
					}
				}
				return {
					post,
					comments,
					remainingCommentSlices,
				};
			},
		});
		return {
			content,
			category,
		};
	},
	component: RouteComponent,
	head: ({ loaderData }) => ({
		meta: [
			{
				title:
					loaderData?.content?.post?.title ||
					"BetterHN - Sleek and Fast HN Reader",
			},
		],
	}),
	notFoundComponent: () => (
		<NotFound>That post has been removed or does not exist.</NotFound>
	),
	pendingComponent: () => (
		<div className="flex h-[100dvh] flex-1 items-center justify-center gap-2 overflow-y-auto bg-zinc-50 pb-14 md:pb-0 dark:bg-black dark:text-zinc-400">
			<HugeiconsIcon className="animate-spin" icon={Loading03Icon} size={36} />
		</div>
	),
});

function RouteComponent() {
	const { content } = Route.useLoaderData();

	const { post, comments, remainingCommentSlices } = content;
	return (
		<div
			className="h-[100dvh] flex-1 overflow-y-auto bg-zinc-50 pb-14 md:pb-0 dark:bg-black"
			id="post-content"
		>
			{/* Post Header */}
			<div className="mb-4 border-gray-200 border-b bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
				<PostBody post={post} />
			</div>

			{/* Comments Section */}
			<Comments
				commentIds={post.kids}
				initialComments={comments}
				postId={post.id}
				remainingCommentSlices={remainingCommentSlices}
				totalComments={post.descendants}
			/>
		</div>
	);
}

function PostBody({ post }: { post: FirebasePostDetail }) {
	return (
		<>
			<div className="mb-3 flex items-center justify-between gap-2">
				<h1
					className="hyphens-auto break-words font-medium text-gray-900 text-lg sm:text-xl dark:text-white"
					style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
				>
					{post.title}
				</h1>
				<div className="flex items-center gap-2 md:flex-row">
					<Button
						asChild
						className="flex items-center gap-2 text-xs"
						size={"sm"}
						variant={"outline"}
					>
						<a
							href={`https://news.ycombinator.com/item?id=${post.id}`}
							rel="noopener noreferrer"
							target="_blank"
						>
							<HugeiconsIcon icon={LinkSquare02Icon} size={16} />
							OP
						</a>
					</Button>
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
						className="flex w-fit items-center gap-2 rounded-md border border-sky-200 bg-sky-100/40 px-2 py-1 text-sky-600 text-sm hover:text-sky-700 dark:border-sky-800 dark:bg-sky-800/40 dark:text-sky-200 dark:hover:text-sky-300"
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
							__html: DOMPurify.sanitize(post.text, {
								USE_PROFILES: { html: true },
								ADD_ATTR: ["target"],
								ALLOWED_ATTR: ["href", "target", "rel"],
							}),
						}}
						id="post-description"
					/>
				</div>
			)}
		</>
	);
}

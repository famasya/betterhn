import { createFileRoute } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import Comments from "~/components/comments";
import { ScrollArea } from "~/components/ui/scroll-area";
import { type CommentItem, loadComments } from "~/functions/load-comments";
import { firebaseFetcher } from "../lib/fetcher";
import type { FirebasePostDetail } from "../lib/types";

export const Route = createFileRoute("/_app/post/$postId")({
	loader: async ({ params: { postId } }) => {
		const postIdNum = postId.split("-").pop();
		const post = await firebaseFetcher
			.get<FirebasePostDetail>(`item/${postIdNum}.json`)
			.json();

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
			<div className="border-gray-200 border-b bg-white p-6">
				<h1 className="mb-3 font-medium text-gray-900 text-xl">{post.title}</h1>
				<div className="flex items-center gap-4 text-gray-600 text-sm">
					<span>
						by <span className="font-medium">{post.by}</span>
					</span>
					<span>•</span>
					<span>{formatRelative(post.time * 1000, Date.now())}</span>
					<span>•</span>
					<span>{post.score} points</span>
					{post.descendants > 0 && (
						<>
							<span>•</span>
							<span>{post.descendants} comments</span>
						</>
					)}
				</div>
				{post.url && (
					<div className="mt-3">
						<a
							className="text-orange-600 text-sm hover:text-orange-700"
							href={post.url}
							rel="noopener noreferrer"
							target="_blank"
						>
							{new URL(post.url).hostname}
						</a>
					</div>
				)}

				{post.text && (
					<div className="mt-4 border-gray-200 border-t pt-4">
						{/** biome-ignore lint/security/noDangerouslySetInnerHtml: content is in html */}
						<div
							className="text-gray-800 text-sm leading-relaxed"
							dangerouslySetInnerHTML={{ __html: post.text }}
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
	);
}

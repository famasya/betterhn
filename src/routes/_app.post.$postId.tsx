import {
	AppleStocksIcon,
	Comment01Icon,
	Time04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import sanitizeHtml from "sanitize-html";
import Comments from "~/components/comments";
import PostSkeleton from "~/components/post-skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { loadComments } from "~/functions/load-comments";
import { usePost } from "~/lib/hooks/use-post";
import type { CommentItem } from "~/lib/types";
import { firebaseFetcher } from "../lib/fetcher";
import type { FirebasePostDetail } from "../lib/types";

export const Route = createFileRoute("/_app/post/$postId")({
	loader: async ({ params: { postId } }) => {
		const postIdNum = Number.parseInt(postId.split("-").pop() || "0", 10);

		// This loader now serves as a fallback for when data isn't cached
		// The component will use the usePost hook which checks cache first
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
			post: {
				...post,
				preloadedComments: initialComments,
				remainingCommentSlices,
			} as FirebasePostDetail,
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
	const loaderData = Route.useLoaderData();

	// Use the post ID directly from the loader data instead of parsing from params
	// This avoids SSR issues with Route.useParams()
	const postIdNum = loaderData.post.id;

	// Use the usePost hook to check cache first, with loader data as fallback
	const {
		data: post,
		isLoading,
		error,
	} = usePost({
		postId: postIdNum,
		initialData: loaderData.post,
	});

	if (isLoading) {
		return <PostSkeleton />;
	}

	if (error || !post) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="mb-2 font-medium text-lg text-red-600">
						Failed to load post
					</div>
					<p className="mb-4 text-gray-600">
						There was an error loading this post. Please try again.
					</p>
					<button
						className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
						onClick={() => window.location.reload()}
						type="button"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	// Use cached comments if available, otherwise fall back to loader data
	const initialComments = post.preloadedComments || loaderData.initialComments;
	const remainingCommentSlices =
		post.remainingCommentSlices || loaderData.remainingCommentSlices;

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
					<div className="mt-4 border-gray-200 border-t border-dashed pt-4">
						<div
							// biome-ignore lint/security/noDangerouslySetInnerHtml: contains html
							dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.text) }}
							id="hn-content"
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

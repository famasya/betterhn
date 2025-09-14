import {
	AppleStocksIcon,
	Comment01FreeIcons,
	InformationCircleIcon,
	Loading03FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { CommentItem, FirebasePostDetail } from "~/lib/types";

type Params = {
	posts: FirebasePostDetail[];
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	fetchNextPage?: () => void;
	error?: Error | null;
	onPostClick?: () => void;
};
export default function PostList({
	posts,
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	error,
	onPostClick,
}: Params) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// replace all non-alphanumeric characters with a dash
	const lowerCaseTitle = (title: string) =>
		title.toLowerCase().replace(/[^a-z0-9]/g, "-");

	const handlePostClick = (
		post: FirebasePostDetail,
		event: React.MouseEvent
	) => {
		event.preventDefault();

		// Check if we have cached data for this post
		const cachedPost = queryClient.getQueryData<FirebasePostDetail>([
			"post",
			post.id,
		]);
		const postId = `${lowerCaseTitle(post.title)}-${post.id}`;

		if (cachedPost || post.preloadedComments !== undefined) {
			// We have cached data or preloaded data, navigate client-side
			// Pre-populate the post cache if it's not already there
			if (!cachedPost && post.preloadedComments !== undefined) {
				queryClient.setQueryData(["post", post.id], post);
			}

			// Navigate using client-side routing
			navigate({
				to: "/post/$postId",
				params: { postId },
			});
		} else {
			// No cached data, fall back to server-side navigation
			// This will trigger the loader in _app.post.$postId.tsx
			window.location.href = `/post/${postId}`;
		}

		// Call the optional callback
		onPostClick?.();
	};

	const prefetchPostWithComments = async (postId: number) => {
		const { firebaseFetcher } = await import("~/lib/fetcher");
		const postData = await firebaseFetcher
			.get<FirebasePostDetail>(`item/${postId}.json`)
			.json();

		if (!postData.kids || postData.kids.length === 0) {
			return postData;
		}

		const initialCommentIds = postData.kids.slice(0, 10);
		const remainingCommentIds = postData.kids.slice(10);

		const remainingCommentSlices: number[][] = [];
		for (let i = 0; i < remainingCommentIds.length; i += 10) {
			remainingCommentSlices.push(remainingCommentIds.slice(i, i + 10));
		}

		let preloadedComments: CommentItem[] = [];
		if (initialCommentIds.length > 0) {
			try {
				const { loadComments } = await import("~/functions/load-comments");
				const commentsResult = await loadComments({
					data: initialCommentIds,
				});
				preloadedComments = commentsResult.comments;
			} catch (prefetchError) {
				console.warn(
					`Failed to prefetch comments for post ${postId}:`,
					prefetchError
				);
			}
		}

		return {
			...postData,
			preloadedComments,
			remainingCommentSlices,
		} as FirebasePostDetail;
	};

	const handlePostHover = (post: FirebasePostDetail) => {
		const cachedPost = queryClient.getQueryData<FirebasePostDetail>([
			"post",
			post.id,
		]);

		const shouldPrefetch = !cachedPost && post.preloadedComments === undefined;

		if (shouldPrefetch) {
			queryClient.prefetchQuery({
				queryKey: ["post", post.id],
				queryFn: () => prefetchPostWithComments(post.id),
				staleTime: 10 * 60 * 1000, // 10 minutes
			});
		}
	};

	return (
		<>
			{posts.map((post) => (
				<button
					className="w-full text-left"
					key={post.id}
					onClick={(event) => handlePostClick(post, event)}
					onMouseEnter={() => handlePostHover(post)}
					type="button"
				>
					<div className="border-gray-200 border-b p-3 text-sm hover:bg-gray-100">
						{post.title}

						<div className="mt-1 flex items-center justify-between gap-2 text-gray-500 text-xs">
							<div className="flex items-center gap-1">
								<HugeiconsIcon icon={AppleStocksIcon} size={16} /> {post.score}{" "}
								points
							</div>
							<div className="flex items-center gap-1">
								<HugeiconsIcon icon={Comment01FreeIcons} size={16} />{" "}
								{post.descendants}
							</div>
						</div>
					</div>
				</button>
			))}

			{hasNextPage && (
				<div className="border-gray-200 border-b p-3">
					<button
						className="flex w-full items-center justify-center rounded-sm border border-orange-200 bg-orange-100 py-1 font-medium text-orange-700 text-sm transition-colors hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isFetchingNextPage}
						onClick={fetchNextPage}
						type="button"
					>
						{isFetchingNextPage ? (
							<HugeiconsIcon
								className="animate-spin"
								icon={Loading03FreeIcons}
								size={16}
							/>
						) : (
							"Load More"
						)}
					</button>
				</div>
			)}

			{error && (
				<div className="border-gray-200 border-b p-3">
					<div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
						<HugeiconsIcon icon={InformationCircleIcon} size={16} />
						<div>
							<div className="font-medium">Failed to load more posts</div>
							<div className="text-red-600 text-xs">
								Some posts may be temporarily unavailable
							</div>
						</div>
						{fetchNextPage && (
							<button
								className="ml-auto rounded border border-red-300 bg-red-100 px-2 py-1 text-xs hover:bg-red-200"
								onClick={fetchNextPage}
								type="button"
							>
								Retry
							</button>
						)}
					</div>
				</div>
			)}

			{!(hasNextPage || error) && fetchNextPage && (
				<div className="p-3 text-center text-gray-500 text-sm">That's all</div>
			)}
		</>
	);
}

import { useQuery } from "@tanstack/react-query";
import { firebaseFetcher } from "~/lib/fetcher";
import type { CommentItem, FirebasePostDetail } from "~/lib/types";

type UsePostParams = {
	postId: number | string;
	initialData?: FirebasePostDetail;
};

export const usePost = ({ postId, initialData }: UsePostParams) => {
	const numericPostId =
		typeof postId === "string" ? Number.parseInt(postId, 10) : postId;

	return useQuery({
		queryKey: ["post", numericPostId],
		queryFn: async () => {
			const post = await firebaseFetcher
				.get<FirebasePostDetail>(`item/${numericPostId}.json`)
				.json();

			// If this post was not preloaded with comments, we need to load them
			if (!post.preloadedComments && post.kids && post.kids.length > 0) {
				const initialCommentIds = post.kids.slice(0, 10);
				const remainingCommentIds = post.kids.slice(10);

				// Create slices for remaining comments
				const remainingCommentSlices: number[][] = [];
				for (let i = 0; i < remainingCommentIds.length; i += 10) {
					remainingCommentSlices.push(remainingCommentIds.slice(i, i + 10));
				}

				// Load initial comments
				let preloadedComments: CommentItem[] = [];
				if (initialCommentIds.length > 0) {
					try {
						const commentPromises = initialCommentIds.map(async (commentId) => {
							try {
								const comment = await firebaseFetcher
									.get<CommentItem>(`item/${commentId}.json`)
									.json();
								return { comment, success: true };
							} catch (error) {
								console.warn(`Failed to fetch comment ${commentId}:`, error);
								return { comment: null, success: false };
							}
						});

						const commentResults = await Promise.allSettled(commentPromises);
						preloadedComments = commentResults
							.filter(
								(
									result
								): result is PromiseFulfilledResult<{
									comment: CommentItem;
									success: true;
								}> =>
									result.status === "fulfilled" &&
									result.value.success &&
									result.value.comment !== null
							)
							.map((result) => result.value.comment);
					} catch (error) {
						console.warn(
							`Failed to load initial comments for post ${numericPostId}:`,
							error
						);
					}
				}

				return {
					...post,
					preloadedComments,
					remainingCommentSlices,
				} as FirebasePostDetail;
			}

			return post;
		},
		initialData,
		staleTime: 10 * 60 * 1000, // 10 minutes for posts
		gcTime: 30 * 60 * 1000, // 30 minutes
		retry: (failureCount, error) => {
			// Retry up to 3 times for network errors, but not for 404s
			if (failureCount < 3) {
				// Don't retry if it's a 404 or similar client error
				const isClientError =
					error &&
					"status" in error &&
					typeof error.status === "number" &&
					error.status >= 400 &&
					error.status < 500;
				return !isClientError;
			}
			return false;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000), // Exponential backoff with max 30s
	});
};

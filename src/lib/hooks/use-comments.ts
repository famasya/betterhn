import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { loadComments } from "~/functions/load-comments";
import type { CommentItem } from "~/lib/types";

type UseCommentsParams = {
	commentIds: number[];
	enabled?: boolean;
};

/**
 * Hook for loading a specific set of comments (used for replies)
 */
export const useComments = ({
	commentIds,
	enabled = true,
}: UseCommentsParams) => {
	return useQuery({
		queryKey: ["comments", commentIds.sort((a, b) => a - b).join(",")],
		queryFn: async () => {
			const result = await loadComments({ data: commentIds });
			return result;
		},
		enabled: enabled && commentIds.length > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
		retry: 3, // Retry up to 3 times
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000), // Exponential backoff with max 10s
	});
};

type UseInfiniteCommentsParams = {
	postId: number;
	initialComments: CommentItem[];
	remainingCommentSlices: number[][];
};

/**
 * Enhanced version of the existing useInfiniteComments hook with better caching
 */
export const useInfiniteComments = ({
	postId,
	initialComments,
	remainingCommentSlices,
}: UseInfiniteCommentsParams) => {
	const result = useInfiniteQuery({
		queryKey: ["post-comments", postId, remainingCommentSlices.length],
		queryFn: async ({ pageParam = 0 }) => {
			if (pageParam === 0) {
				return {
					comments: initialComments,
					sliceIndex: 0,
					failedIds: [],
				};
			}

			const sliceIndex = pageParam - 1;
			const slice = remainingCommentSlices[sliceIndex];

			if (!slice) {
				return { comments: [], sliceIndex, failedIds: [] };
			}

			const loadResult = await loadComments({ data: slice });

			return {
				comments: loadResult.comments,
				sliceIndex,
				failedIds: loadResult.failedIds || [],
			};
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, _allPages) => {
			const nextSliceIndex = lastPage.sliceIndex + 1;
			return nextSliceIndex < remainingCommentSlices.length
				? nextSliceIndex + 1
				: undefined;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
		retry: 3, // Retry up to 3 times
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000), // Exponential backoff with max 10s
	});

	// Flatten all comments from all pages
	const allComments =
		result.data?.pages.flatMap((page) => page.comments) || initialComments;

	// Calculate total failed comments count
	const totalFailedIds =
		result.data?.pages.reduce((acc, page) => acc + page.failedIds.length, 0) ||
		0;

	return {
		...result,
		comments: allComments,
		failedCount: totalFailedIds,
	};
};

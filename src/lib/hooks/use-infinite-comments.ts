import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { type CommentItem, loadComments } from "~/functions/load-comments";

type UseInfiniteCommentsParams = {
	initialComments: CommentItem[];
	remainingCommentSlices: number[][];
	postId: number;
};

export const useInfiniteComments = ({
	initialComments,
	remainingCommentSlices,
	postId,
}: UseInfiniteCommentsParams) => {
	const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

	// Memoized slices with failed IDs re-added to the front
	const enhancedSlices = useMemo(() => {
		if (failedIds.size === 0) {
			return remainingCommentSlices;
		}

		const failedIdsArray = Array.from(failedIds);
		const failedSlices: number[][] = [];

		// Group failed IDs into slices of 10
		for (let i = 0; i < failedIdsArray.length; i += 10) {
			failedSlices.push(failedIdsArray.slice(i, i + 10));
		}

		return [...failedSlices, ...remainingCommentSlices];
	}, [remainingCommentSlices, failedIds]);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfiniteQuery({
		queryKey: [
			"infinite-comments",
			postId,
			remainingCommentSlices.length,
			failedIds.size,
		],
		queryFn: async ({ pageParam }) => {
			if (pageParam === 0) {
				return { comments: initialComments, sliceIndex: 0, failedIds: [] };
			}

			const sliceIndex = pageParam - 1;
			const slice = enhancedSlices[sliceIndex];

			if (!slice) {
				return { comments: [], sliceIndex, failedIds: [] };
			}

			const result = await loadComments({ data: slice });

			// Handle response format from loadComments
			const newFailedIds = result.failedIds || [];

			// Update our failed IDs state - remove successful ones, add new failed ones
			setFailedIds((prev) => {
				const updated = new Set(prev);
				// Remove IDs that were successfully fetched this time
				for (const id of slice) {
					if (!newFailedIds.includes(id)) {
						updated.delete(id);
					}
				}
				// Add newly failed IDs
				for (const id of newFailedIds) {
					updated.add(id);
				}
				return updated;
			});

			return { comments: result.comments, sliceIndex, failedIds: newFailedIds };
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, _allPages) => {
			const nextSliceIndex = lastPage.sliceIndex + 1;
			return nextSliceIndex < enhancedSlices.length
				? nextSliceIndex + 1
				: undefined;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});

	const allComments =
		data?.pages.flatMap((page) => page.comments) || initialComments;
	const totalFailedIds =
		data?.pages.reduce((acc, page) => acc + page.failedIds.length, 0) || 0;

	return {
		comments: allComments,
		fetchNextPage,
		hasNextPage: !!hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
		failedCount: totalFailedIds,
	};
};

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { type CommentItem, loadComments } from "~/functions/load-comments";

type UseInfiniteCommentsParams = {
	initialComments: CommentItem[];
	remainingCommentSlices: number[][];
	postId: number;
	commentIds?: number[];
};

// Helper function to create slices from array of IDs
const createSlicesFromIds = (ids: number[]): number[][] => {
	const slices: number[][] = [];
	for (let i = 0; i < ids.length; i += 10) {
		slices.push(ids.slice(i, i + 10));
	}
	return slices;
};

// Helper function to get failed ID slices
const getFailedSlices = (
	failedIds: Set<number>,
	allowed?: ReadonlySet<number>
): number[][] => {
	if (failedIds.size === 0) {
		return [];
	}
	const ids = Array.from(failedIds).filter((id) => !allowed || allowed.has(id));
	return createSlicesFromIds(ids);
};

export const useInfiniteComments = ({
	initialComments,
	remainingCommentSlices,
	postId,
	commentIds,
}: UseInfiniteCommentsParams) => {
	const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

	// Memoized slices with failed IDs re-added to the front
	const enhancedSlices = useMemo(() => {
		const allowed = new Set(commentIds ?? remainingCommentSlices.flat());
		const failedSlices = getFailedSlices(failedIds, allowed);

		if (remainingCommentSlices.length > 0) {
			if (failedIds.size === 0) {
				return remainingCommentSlices;
			}
			return [...failedSlices, ...remainingCommentSlices];
		}

		if (!commentIds || commentIds.length === 0) {
			return [];
		}

		const slices = createSlicesFromIds(commentIds);
		return failedSlices.length > 0 ? [...failedSlices, ...slices] : slices;
	}, [remainingCommentSlices, commentIds, failedIds]);

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
			commentIds ? commentIds.join(",") : "",
		],
		queryFn: async ({ pageParam }) => {
			if (pageParam === 0) {
				// If we have initialComments, return them
				if (initialComments.length > 0) {
					return { comments: initialComments, sliceIndex: -1, failedIds: [] };
				}
				// If no initialComments but we have commentIds, fetch the first slice
				if (commentIds && commentIds.length > 0 && enhancedSlices.length > 0) {
					const firstSlice = enhancedSlices[0];
					const result = await loadComments({ data: firstSlice });
					const newFailedIds = result.failedIds || [];

					// Update failed IDs state
					setFailedIds((prev) => {
						const updated = new Set(prev);
						for (const id of newFailedIds) {
							updated.add(id);
						}
						return updated;
					});

					return {
						comments: result.comments,
						sliceIndex: 0,
						failedIds: newFailedIds,
					};
				}
				// No comments to load
				return { comments: [], sliceIndex: 0, failedIds: [] };
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
	const totalFailedIds = failedIds.size;

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

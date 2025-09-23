import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchPostBatch, fetchPosts } from "~/lib/fetch-posts";

type UseInfinitePostsParams = {
	category: string;
};

export const useInfinitePosts = ({ category }: UseInfinitePostsParams) => {
	const [failedIds, setFailedIds] = useState<Set<number>>(new Set());
	const [freshRemainingItems, setFreshRemainingItems] = useState<number[][]>(
		[]
	);

	// Memoized slices with failed IDs re-added to the front
	const enhancedSlices = useMemo(() => {
		// Use fresh remaining items from the initial fetch
		const actualRemainingItems = freshRemainingItems;

		if (failedIds.size === 0) {
			return actualRemainingItems;
		}

		const failedIdsArray = Array.from(failedIds);
		const failedSlices: number[][] = [];

		// Group failed IDs into slices of 10
		for (let i = 0; i < failedIdsArray.length; i += 10) {
			failedSlices.push(failedIdsArray.slice(i, i + 10));
		}

		return [...failedSlices, ...actualRemainingItems];
	}, [failedIds, freshRemainingItems]);

	const {
		data,
		fetchNextPage,
		isFetching,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfiniteQuery({
		queryKey: [
			"infinite-posts",
			category,
			enhancedSlices.length,
			failedIds.size,
		],
		queryFn: async ({ pageParam }) => {
			if (pageParam === 0) {
				// Always fetch fresh data for this category on first load
				const freshData = await fetchPosts(category);

				// Store fresh remaining items in state
				setFreshRemainingItems(freshData.remainingItems);
				return {
					posts: freshData.first10,
					sliceIndex: -1,
					failedIds: [],
				};
			}

			const sliceIndex = pageParam - 1;
			const slice = enhancedSlices[sliceIndex];

			if (!slice) {
				return { posts: [], sliceIndex, failedIds: [] };
			}

			const result = await fetchPostBatch(slice);

			// Handle both old and new response formats
			if (Array.isArray(result)) {
				// Old format - just posts array
				return { posts: result, sliceIndex, failedIds: [] };
			}
			// New format - object with posts and failedIds
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

			return { posts: result.posts, sliceIndex, failedIds: newFailedIds };
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

	const allPosts = data?.pages.flatMap((page) => page.posts) || [];

	// Calculate hasNextPage based on enhanced slices
	// Page 0 is initial load, then we need one page per slice
	// If we have 1 page loaded (initial) and 5 slices, we should show Load More
	// If we have 6 pages loaded (initial + 5 slices), we should not show Load More
	const actualHasNextPage =
		enhancedSlices.length > 0 &&
		(data?.pages.length || 0) - 1 < enhancedSlices.length;

	return {
		posts: allPosts,
		fetchNextPage,
		isFetching,
		isLoading,
		hasNextPage: actualHasNextPage,
		isFetchingNextPage,
		error,
	};
};

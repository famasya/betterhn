import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { loadMorePosts } from "~/functions/load-more-posts";
import type { FirebasePostDetail } from "../types";

type UseInfinitePostsParams = {
	initialPosts?: FirebasePostDetail[];
	remainingItems?: number[][];
};

export const useInfinitePosts = ({
	initialPosts = [],
	remainingItems = [],
}: UseInfinitePostsParams) => {
	const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

	// Memoized slices with failed IDs re-added to the front
	const enhancedSlices = useMemo(() => {
		if (failedIds.size === 0) {
			return remainingItems;
		}

		const failedIdsArray = Array.from(failedIds);
		const failedSlices: number[][] = [];

		// Group failed IDs into slices of 10
		for (let i = 0; i < failedIdsArray.length; i += 10) {
			failedSlices.push(failedIdsArray.slice(i, i + 10));
		}

		return [...failedSlices, ...remainingItems];
	}, [remainingItems, failedIds]);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfiniteQuery({
		queryKey: ["infinite-posts", remainingItems.length, failedIds.size],
		queryFn: async ({ pageParam }) => {
			if (pageParam === 0) {
				return { posts: initialPosts, sliceIndex: 0, failedIds: [] };
			}

			const sliceIndex = pageParam - 1;
			const slice = enhancedSlices[sliceIndex];

			if (!slice) {
				return { posts: [], sliceIndex, failedIds: [] };
			}

			const result = await loadMorePosts({ data: slice });

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

	const allPosts = data?.pages.flatMap((page) => page.posts) || initialPosts;

	return {
		posts: allPosts,
		fetchNextPage,
		hasNextPage: !!hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	};
};

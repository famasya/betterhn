import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { loadMorePosts } from "~/functions/load-more-posts";
import { fetchPosts } from "~/lib/fetch-posts";
import type { FirebasePostDetail } from "../types";

type UseInfinitePostsParams = {
	category: string;
	initialPosts?: FirebasePostDetail[];
	remainingItems?: number[][];
};

export const useInfinitePosts = ({
	category,
	initialPosts = [],
	remainingItems = [],
}: UseInfinitePostsParams) => {
	const [failedIds, setFailedIds] = useState<Set<number>>(new Set());
	const freshRemainingItemsRef = useRef<number[][]>([]);

	// If no initial data is provided, we'll fetch it in the query
	const hasInitialData = initialPosts.length > 0 || remainingItems.length > 0;

	// Memoized slices with failed IDs re-added to the front
	const enhancedSlices = useMemo(() => {
		// Use fresh remaining items if available, otherwise use props
		const actualRemainingItems =
			freshRemainingItemsRef.current.length > 0
				? freshRemainingItemsRef.current
				: remainingItems;

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
	}, [remainingItems, failedIds]);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfiniteQuery({
		queryKey: [
			"infinite-posts",
			category,
			remainingItems.length,
			failedIds.size,
		],
		queryFn: async ({ pageParam }) => {
			if (pageParam === 0) {
				// If we have initial posts, use them
				if (hasInitialData) {
					return { posts: initialPosts, sliceIndex: 0, failedIds: [] };
				}
				// Otherwise, fetch fresh data for this category
				const freshData = await fetchPosts(category);
				// Store fresh remaining items in ref
				freshRemainingItemsRef.current = freshData.remainingItems;
				return {
					posts: freshData.first10,
					sliceIndex: 0,
					failedIds: [],
				};
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
		initialData: hasInitialData
			? {
					pages: [{ posts: initialPosts, sliceIndex: 0, failedIds: [] }],
					pageParams: [0],
				}
			: undefined,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});

	const allPosts = data?.pages.flatMap((page) => page.posts) || initialPosts;

	// Calculate hasNextPage based on fresh data if available
	const actualHasNextPage =
		freshRemainingItemsRef.current.length > 0
			? (data?.pages.length || 0) < freshRemainingItemsRef.current.length
			: !!hasNextPage;

	return {
		posts: allPosts,
		fetchNextPage,
		hasNextPage: actualHasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	};
};

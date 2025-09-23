import {
	type InfiniteData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchPostBatch, fetchPosts } from "~/lib/fetch-posts";
import type { FirebasePostDetail } from "../types";

type UseInfinitePostsParams = {
	category: string;
	initialPosts?: FirebasePostDetail[];
	remainingItems?: number[][];
};

type PostsQueryData = {
	first10: FirebasePostDetail[];
	remainingItems: number[][];
};

type InfinitePageData = {
	posts: FirebasePostDetail[];
	remainingItems: number[][];
	pageIndex: number;
	failedIds?: number[];
};

export const useInfinitePosts = ({
	category,
	initialPosts = [],
	remainingItems = [],
}: UseInfinitePostsParams) => {
	const queryClient = useQueryClient();

	// Seed TanStack Query cache with SSR data on first mount
	useEffect(() => {
		if (initialPosts.length > 0 && remainingItems.length > 0) {
			const cacheKey = ["posts", category];
			const existingData = queryClient.getQueryData<PostsQueryData>(cacheKey);

			// Only seed if we don't already have data for this category
			if (!existingData) {
				queryClient.setQueryData<PostsQueryData>(cacheKey, {
					first10: initialPosts,
					remainingItems,
				});
			}
		}
	}, [category, initialPosts, remainingItems, queryClient]);

	const {
		data,
		fetchNextPage,
		isFetching,
		isFetchingNextPage,
		isLoading,
		error,
		hasNextPage,
	} = useInfiniteQuery<
		InfinitePageData,
		Error,
		InfiniteData<InfinitePageData, number>,
		["infinite-posts", string],
		number
	>({
		queryKey: ["infinite-posts", category],
		queryFn: async ({ pageParam = 0, queryKey }): Promise<InfinitePageData> => {
			if (pageParam === 0) {
				// Always fetch fresh data for page 0 to get current remainingItems
				const freshData = await fetchPosts(category);
				return {
					posts: freshData.first10,
					remainingItems: freshData.remainingItems,
					pageIndex: 0,
				};
			}

			// For subsequent pages, we need the remainingItems from page 0
			// Get existing query data to access the first page's remainingItems
			const existingData =
				queryClient.getQueryData<InfiniteData<InfinitePageData, number>>(
					queryKey
				);

			const firstPageData = existingData?.pages[0];
			if (!firstPageData?.remainingItems) {
				return { posts: [], remainingItems: [], pageIndex: pageParam };
			}

			const sliceIndex = pageParam - 1;
			const slice = firstPageData.remainingItems[sliceIndex];

			if (!slice) {
				return {
					posts: [],
					remainingItems: firstPageData.remainingItems,
					pageIndex: pageParam,
				};
			}

			const result = await fetchPostBatch(slice);

			// Handle both old and new response formats
			const posts = Array.isArray(result) ? result : result.posts;
			const failedIds = Array.isArray(result) ? [] : result.failedIds || [];

			// If there are failed IDs, we could handle them here
			// For now, we'll just return the successful posts

			return {
				posts,
				remainingItems: firstPageData.remainingItems,
				pageIndex: pageParam,
				failedIds,
			};
		},
		initialPageParam: 0,
		getNextPageParam: (
			lastPage: InfinitePageData,
			allPages: InfinitePageData[]
		) => {
			// Check if we have more slices to load
			const firstPageData = allPages[0];
			if (!firstPageData?.remainingItems) {
				return;
			}

			const currentPageIndex = lastPage.pageIndex;
			const nextPageIndex = currentPageIndex + 1;

			// We have more pages if there are more slices
			return nextPageIndex <= firstPageData.remainingItems.length
				? nextPageIndex
				: undefined;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});

	// Get all posts from all pages
	const allPosts =
		data?.pages?.flatMap((page: InfinitePageData) => page.posts) || [];

	return {
		posts: allPosts,
		fetchNextPage,
		isFetching,
		isLoading,
		hasNextPage,
		isFetchingNextPage,
		error,
	};
};

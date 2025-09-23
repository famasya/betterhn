import {
	type InfiniteData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { fetchPostBatch, fetchPosts } from "~/lib/fetch-posts";
import type { FirebasePostDetail } from "../types";

type UseInfinitePostsParams = {
	category: string;
	initialPosts?: FirebasePostDetail[];
	remainingItems?: number[][];
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
		queryFn: async ({
			pageParam = 0,
			queryKey,
			signal,
		}): Promise<InfinitePageData> => {
			if (pageParam === 0) {
				// Always fetch fresh data for page 0 to get current remainingItems
				const freshData = await fetchPosts(category, { signal });
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

			const result = await fetchPostBatch(slice, { signal });

			// Handle both old and new response formats
			const { posts, failedIds = [] } = result;
			// Re-queue transient failures as another slice on page 0
			if (failedIds.length > 0) {
				queryClient.setQueryData<InfiniteData<InfinitePageData, number>>(
					["infinite-posts", category],
					(pageData) => {
						if (!pageData?.pages?.[0]) {
							return pageData;
						}
						const pages = [...pageData.pages];
						const first = { ...pages[0] };
						first.remainingItems = [...first.remainingItems, failedIds];
						pages[0] = first;
						return { ...pageData, pages };
					}
				);
			}
			return {
				posts,
				remainingItems: firstPageData.remainingItems,
				pageIndex: pageParam,
				failedIds,
			};
		},
		initialPageParam: 0,
		initialData:
			initialPosts.length > 0 && remainingItems.length > 0
				? {
						pages: [
							{
								posts: initialPosts,
								remainingItems,
								pageIndex: 0,
								failedIds: [],
							},
						],
						pageParams: [0],
					}
				: undefined,
		getNextPageParam: (lastPage: InfinitePageData) => {
			/// Check if we have more slices to load (consult updated cache)
			const queryData = queryClient.getQueryData<
				InfiniteData<InfinitePageData, number>
			>(["infinite-posts", category]);
			const firstPageData = queryData?.pages?.[0];
			if (!firstPageData?.remainingItems) {
				return;
			}
			const nextPageIndex = lastPage.pageIndex + 1;
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

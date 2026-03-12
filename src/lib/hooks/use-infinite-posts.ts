import {
	type InfiniteData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { fetchPosts } from "~/lib/fetch-posts";
import { lowerCaseTitle } from "~/lib/utils";
import type { FirebasePostDetail } from "../types";

type UseInfinitePostsParams = {
	category: string;
	initialPosts?: FirebasePostDetail[];
	initialPage?: number;
	totalPages?: number;
	enabled?: boolean;
};

type InfinitePageData = {
	posts: FirebasePostDetail[];
	page: number;
	hasMore: boolean;
};

export const useInfinitePosts = ({
	category,
	initialPosts = [],
	initialPage = 0,
	totalPages = 1,
	enabled = true,
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
		["posts", string],
		number
	>({
		queryKey: ["posts", category],
		enabled,
		queryFn: async ({ pageParam = 0, signal }): Promise<InfinitePageData> => {
			const result = await fetchPosts(category, pageParam, { signal });

			for (const post of result.posts) {
				queryClient.setQueryData(
					["post", `${lowerCaseTitle(post.title)}-${post.id}`],
					(existing: unknown) =>
						existing ?? {
							post,
							topLevelComments: [],
						}
				);
			}

			return {
				posts: result.posts,
				page: result.page,
				hasMore: result.hasMore,
			};
		},
		initialPageParam: 0,
		initialData:
			initialPosts.length > 0
				? {
						pages: [
							{
								posts: initialPosts,
								page: initialPage,
								hasMore: initialPage < totalPages - 1,
							},
						],
						pageParams: [0],
					}
				: undefined,
		getNextPageParam: (lastPage: InfinitePageData) =>
			lastPage.hasMore ? lastPage.page + 1 : undefined,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	});

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

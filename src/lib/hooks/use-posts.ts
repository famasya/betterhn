import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPosts } from "~/lib/fetch-posts";
import type { FirebasePostDetail } from "~/lib/types";

type PostType = "top" | "best" | "new" | "ask" | "show";

type UsePostsParams = {
	type: PostType;
	initialData?: {
		first10: FirebasePostDetail[];
		slices: number[][];
	};
};

/**
 * Hook for managing post lists with proper caching
 */
export const usePosts = ({ type, initialData }: UsePostsParams) => {
	const queryClient = useQueryClient();

	const result = useQuery({
		queryKey: ["posts", type],
		queryFn: async () => {
			const data = await fetchPosts(type);

			// Populate individual post caches with preloaded data
			for (const post of data.first10) {
				queryClient.setQueryData(["post", post.id], post);
			}

			return data;
		},
		initialData,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	return {
		...result,
		posts: result.data?.first10 || [],
		remainingSlices: result.data?.slices || [],
	};
};

/**
 * Hook for prefetching posts of a specific type
 */
export const usePrefetchPosts = () => {
	const queryClient = useQueryClient();

	const prefetchPosts = (type: PostType) => {
		queryClient.prefetchQuery({
			queryKey: ["posts", type],
			queryFn: () => fetchPosts(type),
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	};

	return { prefetchPosts };
};

/**
 * Hook for getting cached post data without triggering a fetch
 */
export const useCachedPost = (postId: number) => {
	const queryClient = useQueryClient();

	return queryClient.getQueryData<FirebasePostDetail>(["post", postId]);
};

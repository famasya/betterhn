import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchPost } from "~/lib/fetch-posts";

export const usePosts = (postIds: number[]) => {
	return useQueries({
		queries: postIds.map((id) => ({
			queryKey: ["post", id],
			queryFn: () => fetchPost(id),
			staleTime: 5 * 60 * 1000,
		})),
	});
};

export const usePost = (postId: number) => {
	return useQuery({
		queryKey: ["post", postId],
		queryFn: () => fetchPost(postId),
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	});
};

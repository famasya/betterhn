import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { toast } from "sonner";
import { fetchPosts } from "~/lib/fetch-posts";
import type { FirebasePostDetail } from "~/lib/types";

type PostsData = {
	first10: FirebasePostDetail[];
	remainingItems: number[][];
};

export const usePosts = (category: string, initialData?: PostsData) => {
	return useQuery({
		queryKey: ["posts", category],
		queryFn: async () => {
			try {
				return await fetchPosts(category);
			} catch (error) {
				console.error("Failed to fetch posts:", error);
				if (error instanceof HTTPError) {
					toast("Failed to fetch posts", {
						description: error.message,
					});
				} else {
					toast("Failed to fetch posts", {
						description: "Please try again later.",
					});
				}
				return {
					first10: [],
					remainingItems: [],
				};
			}
		},
		initialData,
		placeholderData: (prev) => prev,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

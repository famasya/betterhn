import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { navLinks } from "~/components/desktop-nav";
import { fetchPosts } from "~/lib/fetch-posts";

export const usePrefetchCategories = (currentCategory: string) => {
	const queryClient = useQueryClient();

	useEffect(() => {
		const prefetchCategories = async () => {
			// Extract categories from navLinks and exclude current category
			const categoriesToPrefetch = navLinks
				.map((link) => link.href.split("/")[1]) // Extract category from href like "/top" -> "top"
				.filter((category) => category !== currentCategory);

			// Prefetch each category
			for (const category of categoriesToPrefetch) {
				try {
					await queryClient.prefetchInfiniteQuery({
						queryKey: ["infinite-posts", category, 0, 0],
						queryFn: async () => {
							const freshData = await fetchPosts(category);
							return {
								posts: freshData.first10,
								sliceIndex: -1,
								failedIds: [],
							};
						},
						initialPageParam: 0,
						staleTime: 5 * 60 * 1000, // 5 minutes
						gcTime: 30 * 60 * 1000, // 30 minutes
					});
				} catch (error) {
					// Log error but don't throw - prefetching is enhancement, not critical
					console.warn(`Failed to prefetch category: ${category}`, error);
				}
			}
		};

		// Start prefetching after a small delay to not interfere with initial load
		const timeoutId = setTimeout(prefetchCategories, 100);

		return () => clearTimeout(timeoutId);
	}, [currentCategory, queryClient]);
};

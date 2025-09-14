import { useQuery } from "@tanstack/react-query";
import { fetchTopStories } from "../top-stories";

export const useTopStories = () => {
	return useQuery({
		queryKey: ["top-stories"],
		queryFn: fetchTopStories,
		staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
		refetchOnWindowFocus: false, // Don't refetch when window regains focus
		refetchOnMount: false, // Don't refetch on component mount if data exists
	});
};

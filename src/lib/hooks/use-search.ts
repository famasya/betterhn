import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { AlgoliaPostApiResponse } from "../types";
import { useDebounce } from "../utils";

export const useSearch = (search: string, tags: string) => {
	const debouncedSearch = useDebounce(search, 1000);
	return useQuery({
		queryKey: ["search", debouncedSearch, tags],
		queryFn: async () => {
			const response = await ky.get<AlgoliaPostApiResponse>(
				`https://hn.algolia.com/api/v1/search_by_date?tags=${tags}&query=${debouncedSearch}`
			);
			return response.json();
		},
		enabled: search.length > 0,
	});
};

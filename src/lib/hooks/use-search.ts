import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { AlgoliaPostApiResponse } from "../types";
import { useDebounce } from "../utils";

export const useSearch = (search: string, tags: string, page: number) => {
	const debouncedSearch = useDebounce(search, 1000);
	return useQuery({
		queryKey: ["search", debouncedSearch, tags, page],
		queryFn: async () => {
			const response = await ky.get<AlgoliaPostApiResponse>(
				`https://hn.algolia.com/api/v1/search_by_date?tags=${tags}&query=${debouncedSearch}&page=${page}`
			);
			return response.json();
		},
		enabled: search.length > 0,
	});
};

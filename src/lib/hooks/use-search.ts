import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { AlgoliaPostApiResponse } from "../types";

export const useSearch = (search: string, tags: string, page: number) => {
	return useQuery({
		queryKey: ["search", search, tags, page],
		queryFn: async () => {
			const response = await ky.get<AlgoliaPostApiResponse>(
				`https://hn.algolia.com/api/v1/search_by_date?tags=${tags}&query=${search}&page=${page}`
			);
			return response.json();
		},
		enabled: search.length > 0,
	});
};

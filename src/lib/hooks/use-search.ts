import { useQuery } from "@tanstack/react-query";
import { useSearch as useSearchRouter } from "@tanstack/react-router";
import ky from "ky";
import type { AlgoliaPostApiResponse } from "../types";

export const useSearch = () => {
	const { tags, search, page } = useSearchRouter({ from: "/_app" });
	return useQuery({
		queryKey: ["search", search, tags, page],
		queryFn: async ({ signal }) => {
			const response = await ky.get(
				`https://hn.algolia.com/api/v1/search_by_date?tags=${tags || "story"}&query=${search}&page=${page}`,
				{ signal }
			);
			return response.json<AlgoliaPostApiResponse>();
		},
		enabled: search !== undefined,
	});
};

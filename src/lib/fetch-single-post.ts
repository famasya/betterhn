import type { AlgoliaSinglePostApiResponse } from "./types";

export const fetchSinglePost = async (slug: string) => {
	const postId = slug.split("-").pop();
	const response = await fetch(`https://hn.algolia.com/api/v1/items/${postId}`);
	const data = (await response.json()) as AlgoliaSinglePostApiResponse;
	return data;
};

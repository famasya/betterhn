import { firebaseFetcher } from "./fetcher";
import type { FirebasePostDetail } from "./types";

export const fetchTopStories = async () => {
	// fetch post lists
	const topStories = await firebaseFetcher
		.get("topstories.json")
		.json<number[]>();

	// slices every 10 items
	const slices: number[][] = [];
	for (let i = 0; i < topStories.length; i += 10) {
		slices.push(topStories.slice(i, i + 10));
	}

	// fetch post details for first 10
	const [first10Items, ...restItems] = slices;
	const first10 = await Promise.all(
		first10Items.map((postId) =>
			firebaseFetcher.get<FirebasePostDetail>(`item/${postId}.json`).json()
		)
	);

	return {
		first10,
		slices: restItems,
	};
};

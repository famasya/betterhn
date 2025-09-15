import { firebaseFetcher } from "./fetcher";
import type { FirebasePostDetail } from "./types";

export const fetchPosts = async (type: string) => {
	// fetch post lists
	let url = "topstories.json";
	switch (type) {
		case "best":
			url = "beststories.json";
			break;
		case "new":
			url = "newstories.json";
			break;
		case "ask":
			url = "askstories.json";
			break;
		case "show":
			url = "showstories.json";
			break;
		default:
			url = "topstories.json";
			break;
	}
	const topStories = await firebaseFetcher.get(url).json<number[]>();

	// slices every 10 items
	const slices: number[][] = [];
	for (let i = 0; i < topStories.length; i += 10) {
		slices.push(topStories.slice(i, i + 10));
	}

	// fetch post details for first 10
	const [first10Items, ...remainingItems] = slices;
	const getItems = await Promise.allSettled(
		first10Items.map((postId) =>
			firebaseFetcher.get<FirebasePostDetail>(`item/${postId}.json`).json()
		)
	);

	const successItems: FirebasePostDetail[] = [];
	const failedItems: number[] = [];
	for (const [index, item] of getItems.entries()) {
		if (item.status === "fulfilled") {
			successItems.push(item.value);
		} else {
			failedItems.push(index);
		}
	}

	// re add failed items to remaining items
	remainingItems.push(failedItems);

	return {
		first10: successItems,
		remainingItems,
	};
};

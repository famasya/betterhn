import { firebaseFetcher } from "./fetcher";
import type { FirebasePostDetail } from "./types";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: ignored
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
		if (item.status === "fulfilled" && item.value) {
			// Additional null check for Firebase responses
			if (item.value) {
				successItems.push(item.value);
			} else {
				// Firebase returned null (deleted/missing item)
				const failedId = first10Items[index];
				if (typeof failedId === "number") {
					failedItems.push(failedId);
				}
			}
		} else {
			// requeue actual postId, not index
			const failedId = first10Items[index];
			if (typeof failedId === "number") {
				failedItems.push(failedId);
			}
		}
	}

	// re add failed items to remaining items
	if (failedItems.length > 0) {
		remainingItems.push(failedItems);
	}

	return {
		first10: successItems,
		remainingItems,
	};
};

export const fetchPost = async (
	postId: number
): Promise<FirebasePostDetail> => {
	const data = await firebaseFetcher
		.get(`item/${postId}.json`)
		.json<FirebasePostDetail | null>();
	if (!data) {
		throw new Error(`Post ${postId} not found or removed`);
	}
	return data;
};

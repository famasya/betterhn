import type { Options } from "ky";
import { firebaseFetcher } from "./fetcher";
import type { FirebasePostDetail } from "./types";

export const fetchPosts = async (type: string, options?: Options) => {
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
	const topStories = await firebaseFetcher.get(url, options).json<number[]>();

	// slices every 10 items
	const slices: number[][] = [];
	for (let i = 0; i < topStories.length; i += 10) {
		slices.push(topStories.slice(i, i + 10));
	}

	// fetch post details for first 10
	const [first10Items, ...remainingItems] = slices;
	const getItems = await Promise.allSettled(
		first10Items.map((postId) =>
			firebaseFetcher
				.get(`item/${postId}.json`, options)
				.json<FirebasePostDetail | null>()
		)
	);

	const successItems: FirebasePostDetail[] = [];
	const failedItems: number[] = [];
	for (const [index, item] of getItems.entries()) {
		const id = first10Items[index];
		if (item.status === "fulfilled") {
			const post = item.value;
			if (post && !post.deleted) {
				successItems.push(post);
			}
			// else: deleted/missing → drop; don't requeue
		} else if (typeof id === "number") {
			// transient failure → requeue
			failedItems.push(id);
		}
	}

	// re add failed items to remaining items
	if (failedItems.length > 0) {
		remainingItems.push(failedItems);
	}

	const result = {
		first10: successItems,
		remainingItems,
	};

	return result;
};

export const fetchPost = async (
	postId: number
): Promise<FirebasePostDetail> => {
	const data = await firebaseFetcher
		.get(`item/${postId}.json`)
		.json<FirebasePostDetail | null>();
	if (!data || data.deleted) {
		throw new Error(`Post ${postId} not found or removed`);
	}
	return data;
};

import type { Options } from "ky";
import { getBindings } from "./bindings";
import { firebaseFetcher } from "./fetcher";
import type { FirebasePostDetail } from "./types";

const CACHE_TTL = 300; // 5 minutes in seconds

export const fetchPosts = async (type: string, options?: Options) => {
	const { KV } = getBindings();

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

	// Try to get cached post list
	const cacheKey = `stories:${type}`;
	const cachedStories = await KV.get(cacheKey);
	let topStories: number[];

	if (cachedStories) {
		topStories = JSON.parse(cachedStories);
	} else {
		topStories = await firebaseFetcher.get(url, options).json<number[]>();
		// Cache the post list for 5 minutes
		await KV.put(cacheKey, JSON.stringify(topStories), {
			expirationTtl: CACHE_TTL,
		});
	}

	// slices every 10 items
	const slices: number[][] = [];
	for (let i = 0; i < topStories.length; i += 10) {
		slices.push(topStories.slice(i, i + 10));
	}

	// fetch post details for first 10
	const [first10Items, ...remainingItems] = slices;

	// Check cache for individual posts
	const cachedPosts = await Promise.all(
		first10Items.map(async (postId) => {
			const postCacheKey = `post:${postId}`;
			const cachedPost = await KV.get(postCacheKey);
			return cachedPost
				? { postId, data: JSON.parse(cachedPost) as FirebasePostDetail }
				: null;
		})
	);

	// Separate cached and uncached posts
	const cachedPostData = cachedPosts.filter(
		(item): item is { postId: number; data: FirebasePostDetail } =>
			item !== null
	);
	const uncachedIds = first10Items.filter(
		(postId) => !cachedPosts.some((item) => item?.postId === postId)
	);

	// Fetch uncached posts
	const getItems = await Promise.allSettled(
		uncachedIds.map((postId) =>
			firebaseFetcher
				.get(`item/${postId}.json`, options)
				.json<FirebasePostDetail | null>()
				.then((data) => ({ postId, data }))
		)
	);

	const successItems: FirebasePostDetail[] = [
		...cachedPostData.map((item) => item.data),
	];
	const failedItems: number[] = [];

	for (const [index, item] of getItems.entries()) {
		const postId = uncachedIds[index];
		if (item.status === "fulfilled") {
			const { data: post } = item.value;
			if (post && !post.deleted) {
				successItems.push(post);
				// Cache the post for 5 minutes
				const postCacheKey = `post:${postId}`;
				await KV.put(postCacheKey, JSON.stringify(post), {
					expirationTtl: CACHE_TTL,
				});
			}
			// else: deleted/missing → drop; don't requeue
		} else if (typeof postId === "number") {
			// transient failure → requeue
			failedItems.push(postId);
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
	const { KV } = getBindings();

	// Try to get cached post
	const postCacheKey = `post:${postId}`;
	const cachedPost = await KV.get(postCacheKey);

	if (cachedPost) {
		const data = JSON.parse(cachedPost) as FirebasePostDetail;
		if (!data.deleted) {
			return data;
		}
	}

	// Fetch from API if not cached or deleted
	const data = await firebaseFetcher
		.get(`item/${postId}.json`)
		.json<FirebasePostDetail | null>();
	if (!data || data.deleted) {
		throw new Error(`Post ${postId} not found or removed`);
	}

	// Cache the post for 5 minutes
	await KV.put(postCacheKey, JSON.stringify(data), {
		expirationTtl: CACHE_TTL,
	});

	return data;
};

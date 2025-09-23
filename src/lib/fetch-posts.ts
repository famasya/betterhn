import { notFound } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import type { Options } from "ky";
import { firebaseFetcher } from "./fetcher";
import type { FirebasePostDetail } from "./types";

export const fetchPostBatch = createIsomorphicFn()
	.server(async (ids: number[], options?: Options) => {
		// Fetch all posts directly
		const getItems = await Promise.allSettled(
			ids.map((postId) =>
				firebaseFetcher
					.get(`item/${postId}.json`, options)
					.json<FirebasePostDetail | null>()
					.then((data) => ({ postId, data }))
			)
		);

		const successItems: FirebasePostDetail[] = [];
		const failedItems: number[] = [];

		for (const [index, item] of getItems.entries()) {
			const postId = ids[index];
			if (item.status === "fulfilled") {
				const { data: post } = item.value;
				if (post && !post.deleted) {
					successItems.push(post);
				}
				// else: deleted/missing → drop; don't requeue
			} else {
				// transient failure → requeue
				failedItems.push(postId);
			}
		}

		return {
			posts: successItems,
			failedIds: failedItems,
		};
	})
	.client(async (ids: number[], options?: Options) => {
		// Fetch posts directly without caching
		const getItems = await Promise.allSettled(
			ids.map((postId) =>
				firebaseFetcher
					.get(`item/${postId}.json`, options)
					.json<FirebasePostDetail | null>()
					.then((data) => ({ postId, data }))
			)
		);

		const successItems: FirebasePostDetail[] = [];
		const failedItems: number[] = [];

		for (const [index, item] of getItems.entries()) {
			const postId = ids[index];
			if (item.status === "fulfilled") {
				const { data: post } = item.value;
				if (post && !post.deleted) {
					successItems.push(post);
				}
				// else: deleted/missing → drop; don't requeue
			} else {
				// transient failure → requeue
				failedItems.push(postId);
			}
		}

		return {
			posts: successItems,
			failedIds: failedItems,
		};
	});

export const fetchPosts = createIsomorphicFn()
	.server(async (type: string, options?: Options) => {
		// fetch post lists
		const url = resolveCategory(type);

		// Fetch post list directly
		const topStories = await firebaseFetcher.get(url, options).json<number[]>();

		// slices every 10 items
		const slices: number[][] = [];
		for (let i = 0; i < topStories.length; i += 10) {
			slices.push(topStories.slice(i, i + 10));
		}

		// fetch post details for first 10
		const [first10Items, ...remainingItems] = slices;

		const batchResult = await fetchPostBatch(first10Items, options);

		const successItems = batchResult.posts;
		const failedItems = batchResult.failedIds;

		// re add failed items to remaining items
		if (failedItems.length > 0) {
			remainingItems.push(failedItems);
		}

		const result = {
			first10: successItems,
			remainingItems,
		};

		return result;
	})
	.client(async (type: string, options?: Options) => {
		// fetch post lists
		const url = resolveCategory(type);

		// Direct fetch without caching on client
		const topStories = await firebaseFetcher.get(url, options).json<number[]>();

		// slices every 10 items
		const slices: number[][] = [];
		for (let i = 0; i < topStories.length; i += 10) {
			slices.push(topStories.slice(i, i + 10));
		}

		// fetch post details for first 10
		const [first10Items, ...remainingItems] = slices;

		const batchResult = await fetchPostBatch(first10Items, options);

		const successItems = batchResult.posts;
		const failedItems = batchResult.failedIds;

		// re add failed items to remaining items
		if (failedItems.length > 0) {
			remainingItems.push(failedItems);
		}

		const result = {
			first10: successItems,
			remainingItems,
		};

		return result;
	});

export const fetchPost = createIsomorphicFn()
	.server(async (postId: number): Promise<FirebasePostDetail> => {
		// Fetch from API directly
		const data = await firebaseFetcher
			.get(`item/${postId}.json`)
			.json<FirebasePostDetail | null>();
		if (!data || data.deleted) {
			throw notFound();
		}

		return data;
	})
	.client(async (postId: number): Promise<FirebasePostDetail> => {
		// Direct fetch without caching on client
		const data = await firebaseFetcher
			.get(`item/${postId}.json`)
			.json<FirebasePostDetail | null>();
		if (!data || data.deleted) {
			throw notFound();
		}

		return data;
	});

const resolveCategory = (type: string) => {
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
		case "job":
			url = "jobstories.json";
			break;
		default:
			url = "topstories.json";
			break;
	}
	return url;
};

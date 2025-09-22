import { createServerFn } from "@tanstack/react-start";
import { getBindings } from "~/lib/bindings";
import { firebaseFetcher } from "~/lib/fetcher";
import type { FirebasePostDetail } from "~/lib/types";

const CACHE_TTL = 300; // 5 minutes in seconds

export const loadMorePosts = createServerFn({
	method: "GET",
	response: "data",
})
	.validator((slices: number[]) => {
		return slices;
	})
	.handler(async ({ data, signal }) => {
		const { KV } = getBindings();

		const results = await Promise.all(
			data.map(async (postId) => {
				try {
					// Try to get cached post first
					const postCacheKey = `post:${postId}`;
					const cachedPost = await KV.get(postCacheKey);

					if (cachedPost) {
						const post = JSON.parse(cachedPost) as FirebasePostDetail;
						if (!post.deleted) {
							return { postId, post, ok: true };
						}
					}

					// Fetch from API if not cached or deleted
					const post = await firebaseFetcher
						.get(`item/${postId}.json`, { signal })
						.json<FirebasePostDetail | null>();

					if (post && !post.deleted) {
						// Cache the post for 5 minutes
						await KV.put(postCacheKey, JSON.stringify(post), {
							expirationTtl: CACHE_TTL,
						});
					}

					return { postId, post, ok: true };
				} catch {
					// reuse in failedIds
					return { postId, post: null, ok: false };
				}
			})
		);

		const successfulPosts: FirebasePostDetail[] = [];
		const failedPostIds: number[] = [];

		for (const result of results) {
			if (result.ok) {
				if (result.post) {
					successfulPosts.push(result.post);
				}
			} else {
				failedPostIds.push(result.postId);
			}
		}

		return {
			posts: successfulPosts,
			failedIds: failedPostIds,
		};
	});

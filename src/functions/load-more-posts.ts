import { createServerFn } from "@tanstack/react-start";
import { firebaseFetcher } from "~/lib/fetcher";
import type { FirebasePostDetail } from "~/lib/types";

export const loadMorePosts = createServerFn({
	method: "GET",
})
	.inputValidator((slices: number[]) => slices)
	.handler(async ({ data, signal }) => {
		const results = await Promise.all(
			data.map(async (postId) => {
				try {
					// Fetch from API directly
					const post = await firebaseFetcher
						.get(`item/${postId}.json`, { signal })
						.json<FirebasePostDetail | null>();

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

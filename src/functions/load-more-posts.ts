import { createServerFn } from "@tanstack/react-start";
import { firebaseFetcher } from "~/lib/fetcher";
import type { FirebasePostDetail } from "~/lib/types";

export const loadMorePosts = createServerFn({
	method: "GET",
	response: "data",
})
	.validator((slices: number[]) => {
		return slices;
	})
	.handler(async ({ data }) => {
		const results = await Promise.allSettled(
			data.map(async (postId) => {
				try {
					const post = await firebaseFetcher
						.get(`item/${postId}.json`)
						.json<FirebasePostDetail | null>();
					return { postId, post };
				} catch (error) {
					// reuse in failedIds
					return { postId, error };
				}
			})
		);

		const successfulPosts: FirebasePostDetail[] = [];
		const failedPostIds: number[] = [];

		for (const result of results) {
			if (result.status === "fulfilled") {
				if (result.value.post) {
					successfulPosts.push(result.value.post);
				} else {
					failedPostIds.push(result.value.postId);
				}
			} else {
				failedPostIds.push(result.reason.postId);
			}
		}

		return {
			posts: successfulPosts,
			failedIds: failedPostIds,
		};
	});

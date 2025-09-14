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
						.get<FirebasePostDetail>(`item/${postId}.json`)
						.json();
					return { postId, post, success: true };
				} catch (error) {
					console.warn(`Failed to fetch post ${postId}:`, error);
					return { postId, post: null, success: false };
				}
			})
		);

		const successfulPosts: FirebasePostDetail[] = [];
		const failedPostIds: number[] = [];

		for (const result of results) {
			if (result.status === "fulfilled") {
				if (result.value.success && result.value.post) {
					successfulPosts.push(result.value.post);
				} else {
					failedPostIds.push(result.value.postId);
				}
			} else {
				// This shouldn't happen with our try-catch, but just in case
				console.error(
					"Unexpected Promise.allSettled rejection:",
					result.reason
				);
			}
		}

		console.log(
			`Loaded ${successfulPosts.length}/${data.length} posts successfully`
		);

		if (failedPostIds.length > 0) {
			console.log(`Failed post IDs to retry: ${failedPostIds.join(", ")}`);
		}

		return {
			posts: successfulPosts,
			failedIds: failedPostIds,
		};
	});

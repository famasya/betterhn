import { firebaseFetcher } from "./fetcher";
import type { CommentItem, FirebasePostDetail } from "./types";

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

	// fetch post details for first 10 with preloaded comments
	const [first10Items, ...restItems] = slices;
	const first10 = await Promise.all(
		first10Items.map(async (postId) => {
			// Fetch post details
			const post = await firebaseFetcher
				.get<FirebasePostDetail>(`item/${postId}.json`)
				.json();

			// Preload top 10 comments if post has comments
			let preloadedComments: CommentItem[] = [];
			const remainingCommentSlices: number[][] = [];

			if (post.kids && post.kids.length > 0) {
				// Take first 10 comment IDs for initial load
				const initialCommentIds = post.kids.slice(0, 10);
				const remainingCommentIds = post.kids.slice(10);

				// Create slices of 10 for remaining comments
				for (let i = 0; i < remainingCommentIds.length; i += 10) {
					remainingCommentSlices.push(remainingCommentIds.slice(i, i + 10));
				}

				// Fetch initial comments
				if (initialCommentIds.length > 0) {
					try {
						const commentPromises = initialCommentIds.map(async (commentId) => {
							try {
								const comment = await firebaseFetcher
									.get<CommentItem>(`item/${commentId}.json`)
									.json();
								return { comment, success: true };
							} catch (error) {
								console.warn(`Failed to fetch comment ${commentId}:`, error);
								return { comment: null, success: false };
							}
						});

						const commentResults = await Promise.allSettled(commentPromises);
						preloadedComments = commentResults
							.filter(
								(
									result
								): result is PromiseFulfilledResult<{
									comment: CommentItem;
									success: true;
								}> =>
									result.status === "fulfilled" &&
									result.value.success &&
									result.value.comment !== null
							)
							.map((result) => result.value.comment);
					} catch (error) {
						console.warn(
							`Failed to load initial comments for post ${postId}:`,
							error
						);
					}
				}
			}

			// Return enhanced post with preloaded data
			return {
				...post,
				preloadedComments,
				remainingCommentSlices,
			} as FirebasePostDetail;
		})
	);

	return {
		first10,
		slices: restItems,
	};
};

import { createServerFn } from "@tanstack/react-start";
import { firebaseFetcher } from "~/lib/fetcher";

export type CommentItem = {
	by: string;
	id: number;
	kids: number[];
	parent: number;
	text: string | null;
	deleted?: boolean;
	time: number;
	type: string;
};

export const loadComments = createServerFn({
	method: "GET",
	response: "data",
})
	.validator((commentIds: number[]) => {
		return commentIds;
	})
	.handler(async ({ data, signal }) => {
		const comments = await Promise.allSettled(
			data.map(async (commentId) => {
				const comment = await firebaseFetcher
					.get(`item/${commentId}.json`, { signal })
					.json<CommentItem>();
				return { commentId, comment, success: true };
			})
		);

		const successfulComments: CommentItem[] = [];
		const failedCommentIds: number[] = [];
		for (const result of comments) {
			if (result.status === "fulfilled") {
				if (result.value.success && result.value.comment) {
					successfulComments.push(result.value.comment);
				} else {
					failedCommentIds.push(result.value.commentId);
				}
			}
		}
		return {
			comments: successfulComments,
			failedIds: failedCommentIds,
		};
	});

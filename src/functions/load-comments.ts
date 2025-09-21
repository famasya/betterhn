import { createServerFn } from "@tanstack/react-start";
import { firebaseFetcher } from "~/lib/fetcher";

export type CommentItem = {
	by: string;
	id: number;
	kids: number[];
	parent: number;
	text: string;
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
	.handler(async ({ data }) => {
		const comments = await Promise.allSettled(
			data.map(async (commentId) => {
				const comment = await firebaseFetcher
					.get<CommentItem>(`item/${commentId}.json`)
					.json();
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
			comments: successfulComments.sort((a, b) => b.id - a.id),
			failedIds: failedCommentIds,
		};
	});

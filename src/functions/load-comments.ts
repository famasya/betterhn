import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mapAlgoliaChildToComment } from "~/lib/fetch-posts";
import { fetchAlgoliaJson } from "~/lib/fetcher";
import type { AlgoliaItemChild } from "~/lib/types";

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
})
	.inputValidator((input: number[]) =>
		z.array(z.number().int().positive()).parse(input)
	)
	.handler(async ({ data, signal }) => {
		const comments = await Promise.allSettled(
			data.map(async (commentId) => {
				const comment = await fetchAlgoliaJson<AlgoliaItemChild>(
					`items/${commentId}`,
					{ signal, cacheTtl: 300 }
				);
				return { commentId, comment, success: true };
			})
		);

		const successfulComments: CommentItem[] = [];
		const failedCommentIds: number[] = [];
		for (const [index, result] of comments.entries()) {
			if (result.status === "fulfilled") {
				if (result.value.success && result.value.comment) {
					successfulComments.push(
						mapAlgoliaChildToComment(result.value.comment)
					);
				} else {
					failedCommentIds.push(result.value.commentId);
				}
			} else {
				failedCommentIds.push(data[index]);
			}
		}
		return {
			comments: successfulComments,
			failedIds: failedCommentIds,
		};
	});

export const loadReplies = createServerFn({
	method: "GET",
})
	.inputValidator((parentId: number) =>
		z.number().int().positive().parse(parentId)
	)
	.handler(async ({ data: parentId, signal }) => {
		const item = await fetchAlgoliaJson<AlgoliaItemChild>(`items/${parentId}`, {
			signal,
			cacheTtl: 300,
		});

		if (!item?.children) {
			return { comments: [] as CommentItem[], failedIds: [] as number[] };
		}

		return {
			comments: item.children.map(mapAlgoliaChildToComment),
			failedIds: [] as number[],
		};
	});

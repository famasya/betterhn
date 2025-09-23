import { createIsomorphicFn } from "@tanstack/react-start";
import type { Options } from "ky";
import type { CommentItem } from "~/functions/load-comments";
import { firebaseFetcher } from "~/lib/fetcher";
import { getBindings } from "./bindings";
import { getBrowserQueryClient } from "./query-client";

const CACHE_TTL = 300; // 5 minutes in seconds

export const fetchComments = createIsomorphicFn()
	.server(async (commentIds: number[], options?: Options) => {
		const { KV } = getBindings();

		const cachedComments = await Promise.all(
			commentIds.map(async (commentId) => {
				const commentCacheKey = `comment:${commentId}`;
				const cachedComment = await KV.get(commentCacheKey);
				return cachedComment
					? { commentId, data: JSON.parse(cachedComment) as CommentItem }
					: null;
			})
		);

		// Fold cached data in the result
		const cachedCommentData = cachedComments
			.filter(
				(item): item is { commentId: number; data: CommentItem } =>
					item !== null
			)
			.map((item) => item.data);

		const uncachedIds = commentIds.filter(
			(commentId) =>
				!cachedComments.some((item) => item?.commentId === commentId)
		);

		const getItems = await Promise.allSettled(
			uncachedIds.map((commentId) =>
				firebaseFetcher
					.get(`item/${commentId}.json`, options)
					.json<CommentItem | null>()
					.then((data) => ({ commentId, data }))
			)
		);

		const successItems: CommentItem[] = [...cachedCommentData];
		const failedItems: number[] = [];

		for (const [index, item] of getItems.entries()) {
			const commentId = uncachedIds[index];
			if (item.status === "fulfilled") {
				const { data: comment } = item.value;
				if (comment) {
					successItems.push(comment);
					// Cache the comment for 5 minutes
					const commentCacheKey = `comment:${commentId}`;
					await KV.put(commentCacheKey, JSON.stringify(comment), {
						expirationTtl: CACHE_TTL,
					});
				}
				// else: deleted/missing → drop; don't requeue
			} else {
				// transient failure → requeue
				failedItems.push(commentId);
			}
		}

		return {
			comments: successItems,
			failedIds: failedItems,
		};
	})
	.client(async (commentIds: number[], options?: Options) => {
		// fetch with queryClient
		const queryClient = getBrowserQueryClient();
		const comments = await Promise.allSettled(
			commentIds.map(async (commentId) =>
				queryClient.ensureQueryData({
					queryKey: ["comment", commentId],
					staleTime: 5 * 60 * 1000, // 5 minutes
					gcTime: 10 * 60 * 1000, // 10 minutes
					queryFn: async () =>
						await firebaseFetcher
							.get(`item/${commentId}.json`, options)
							.json<CommentItem | null>(),
				})
			)
		);
		const successItems: CommentItem[] = [];
		const failedItems: number[] = [];

		for (const [index, item] of comments.entries()) {
			const commentId = commentIds[index];
			if (item.status === "fulfilled") {
				const comment = item.value;
				if (comment) {
					successItems.push(comment);
				}
				// else: deleted/missing → drop; don't requeue
			} else {
				// transient failure → requeue
				failedItems.push(commentId);
			}
		}

		return {
			comments: successItems,
			failedIds: failedItems,
		};
	});

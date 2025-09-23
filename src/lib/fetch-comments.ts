import { createIsomorphicFn } from "@tanstack/react-start";
import type { Options } from "ky";
import type { CommentItem } from "~/functions/load-comments";
import { firebaseFetcher } from "~/lib/fetcher";
import { getBindings } from "./bindings";

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

		const successItems: CommentItem[] = [];
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
		// Direct fetch without caching on client
		const getItems = await Promise.allSettled(
			commentIds.map((commentId) =>
				firebaseFetcher
					.get(`item/${commentId}.json`, options)
					.json<CommentItem | null>()
					.then((data) => ({ commentId, data }))
			)
		);

		const successItems: CommentItem[] = [];
		const failedItems: number[] = [];

		for (const [index, item] of getItems.entries()) {
			const commentId = commentIds[index];
			if (item.status === "fulfilled") {
				const { data: comment } = item.value;
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

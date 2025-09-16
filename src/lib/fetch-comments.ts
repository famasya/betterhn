import { useQueries, useQuery } from "@tanstack/react-query";
import type { CommentItem } from "~/functions/load-comments";
import { firebaseFetcher } from "~/lib/fetcher";

export const fetchComment = async (commentId: number): Promise<CommentItem> => {
	const data = await firebaseFetcher
		.get(`item/${commentId}.json`)
		.json<CommentItem | null>();
	if (!data) {
		throw new Error(`Comment ${commentId} not found or removed`);
	}
	return data;
};

export const useComment = (commentId: number) => {
	return useQuery({
		queryKey: ["comment", commentId],
		queryFn: () => fetchComment(commentId),
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	});
};

export const useComments = (commentIds: number[]) => {
	return useQueries({
		queries: commentIds.map((id) => ({
			queryKey: ["comment", id],
			queryFn: () => fetchComment(id),
			staleTime: 5 * 60 * 1000,
		})),
	});
};

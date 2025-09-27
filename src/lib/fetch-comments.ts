import { useQuery } from "@tanstack/react-query";
import type { Options } from "ky";
import type { CommentItem } from "~/functions/load-comments";
import { firebaseFetcher } from "~/lib/fetcher";

export const fetchComment = async (
	commentId: number,
	options?: Options
): Promise<CommentItem> => {
	const data = await firebaseFetcher
		.get(`item/${commentId}.json`, options)
		.json<CommentItem | null>();
	if (!data) {
		throw new Error(`Comment ${commentId} not found or removed`);
	}
	return data;
};

export const useComment = (commentId: number) =>
	useQuery({
		queryKey: ["comment", commentId],
		queryFn: () => fetchComment(commentId),
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	});

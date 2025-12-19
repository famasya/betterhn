import { useQuery } from "@tanstack/react-query";
import { memo, useState } from "react";
import type { CommentItem as CommentItemType } from "~/functions/load-comments";
import { loadComments } from "~/functions/load-comments";
import { CommentActions } from "./comment-actions";
import { CommentContent } from "./comment-content";
import { CommentHeader } from "./comment-header";
import { CommentReplies } from "./comment-replies";

type CommentItemProps = {
	comment: CommentItemType;
	depth?: number;
};

export const CommentItem = memo(function CommentItemComponent({
	comment,
	depth = 0,
}: CommentItemProps) {
	const hasReplies = comment.kids && comment.kids.length > 0;
	// Auto-expand first level of replies (depth === 0 means top-level comment)
	const [showReplies, setShowReplies] = useState(depth === 0 && hasReplies);

	// Fetch replies data when needed
	const { data, isLoading, error } = useQuery({
		queryKey: [
			"comment-replies",
			{ ids: comment.kids ? [...comment.kids].sort((a, b) => a - b) : [] },
		],
		queryFn: async () => {
			if (!comment.kids) {
				return { comments: [], failedIds: [] };
			}
			const result = await loadComments({ data: comment.kids });
			return result;
		},
		enabled: showReplies && hasReplies && !!comment.kids,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});

	const handleToggleReplies = () => {
		setShowReplies(!showReplies);
	};

	if (comment.deleted) {
		return null;
	}

	return (
		<>
			<div className="border-gray-200 border-b pt-3 pb-1 dark:border-white/20">
				<CommentHeader by={comment.by} id={comment.id} time={comment.time} />
				<CommentContent deleted={comment.deleted} text={comment.text} />
				<CommentActions
					commentId={comment.id}
					deleted={comment.deleted}
					hasReplies={hasReplies}
					isLoadingReplies={showReplies && isLoading}
					onToggleReplies={handleToggleReplies}
					parentId={comment.parent}
					repliesCount={comment.kids?.length}
				/>
			</div>

			{showReplies && hasReplies && comment.kids ? (
				<CommentReplies
					commentsData={data}
					depth={depth}
					error={error}
					isLoading={isLoading}
				/>
			) : null}
		</>
	);
});

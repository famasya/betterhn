import { memo, useState } from "react";
import type { CommentItem as CommentItemType } from "~/functions/load-comments";
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

	const handleToggleReplies = () => {
		setShowReplies(!showReplies);
	};

	if (comment.deleted) {
		return null;
	}

	return (
		<>
			<div className="border-gray-200 border-b pt-3 pb-1 dark:border-white/20">
				<CommentHeader by={comment.by} time={comment.time} />
				<CommentContent deleted={comment.deleted} text={comment.text} />
				<CommentActions
					commentId={comment.id}
					deleted={comment.deleted}
					hasReplies={hasReplies}
					onToggleReplies={handleToggleReplies}
					parentId={comment.parent}
					repliesCount={comment.kids?.length}
				/>
			</div>

			{showReplies && hasReplies && comment.kids ? (
				<CommentReplies commentIds={comment.kids} depth={depth} />
			) : null}
		</>
	);
});

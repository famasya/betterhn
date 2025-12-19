import {
	Comment01FreeIcons,
	CommentAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "~/components/ui/button";

type CommentActionsProps = {
	commentId: number;
	parentId: number;
	deleted?: boolean;
	hasReplies: boolean;
	repliesCount?: number;
	onToggleReplies: () => void;
};

export function CommentActions({
	commentId,
	parentId,
	deleted,
	hasReplies,
	repliesCount = 0,
	onToggleReplies,
}: CommentActionsProps) {
	return (
		<div className="mt-2 flex items-center justify-end gap-1 text-gray-600 text-xs">
			{deleted ? (
				<Button
					className="flex items-center gap-1 text-xs dark:text-gray-400"
					disabled
					size="sm"
					type="button"
					variant="ghost"
				>
					<HugeiconsIcon icon={CommentAdd01Icon} size={14} />
					Reply
				</Button>
			) : (
				<a
					href={`https://news.ycombinator.com/reply?id=${commentId}&goto=item?id=${parentId}#${commentId}`}
					rel="noopener noreferrer"
					target="_blank"
				>
					<Button
						className="flex items-center gap-1 text-xs dark:text-gray-400"
						size="sm"
						type="button"
						variant="ghost"
					>
						<HugeiconsIcon icon={CommentAdd01Icon} size={14} />
						Reply
					</Button>
				</a>
			)}
			{hasReplies ? (
				<Button
					className="flex cursor-pointer items-center gap-1 text-orange-600 text-xs hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200"
					disabled={deleted}
					onClick={onToggleReplies}
					size="sm"
					type="button"
					variant="ghost"
				>
					<HugeiconsIcon icon={Comment01FreeIcons} size={14} />
					<span>
						{repliesCount} {repliesCount === 1 ? "reply" : "replies"}
					</span>
				</Button>
			) : null}
		</div>
	);
}

import { Loading03FreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { loadComments } from "~/functions/load-comments";
import { cn } from "~/lib/utils";
import { CommentItem } from "./comment-item";
import { borderColorLevel, INITIAL_REPLIES_LIMIT } from "./utils";

type CommentRepliesProps = {
	depth: number;
	commentsData: Awaited<ReturnType<typeof loadComments>> | undefined;
	isLoading: boolean;
	error: Error | null;
};

export function CommentReplies({
	depth,
	commentsData,
	isLoading,
	error,
}: CommentRepliesProps) {
	const [showAllReplies, setShowAllReplies] = useState(false);
	const isFirstLevel = depth === 0;

	if (isLoading) {
		return (
			<div
				className={cn(
					"ml-4 border-l-1 border-dashed py-2 pl-4",
					borderColorLevel(depth)
				)}
			>
				<div className="flex items-center gap-2 text-gray-500 text-sm">
					<HugeiconsIcon
						className="animate-spin"
						icon={Loading03FreeIcons}
						size={16}
					/>
					Loading replies...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="ml-4 border-white/20 border-l py-2 pl-4">
				<div className="text-red-600 text-sm">Failed to load replies</div>
			</div>
		);
	}

	const comments = commentsData?.comments || [];
	const shouldLimitReplies =
		isFirstLevel && comments.length > INITIAL_REPLIES_LIMIT;
	const visibleComments =
		shouldLimitReplies && !showAllReplies
			? comments.slice(0, INITIAL_REPLIES_LIMIT)
			: comments;
	const remainingCount = comments.length - INITIAL_REPLIES_LIMIT;

	return (
		<div
			className={cn(
				"ml-4 border-l-1 border-dashed pl-4",
				borderColorLevel(depth)
			)}
		>
			{visibleComments.map((comment) => (
				<CommentItem comment={comment} depth={depth + 1} key={comment.id} />
			))}

			{shouldLimitReplies && !showAllReplies && (
				<div className="pt-3">
					<Button
						className="w-full text-sm"
						onClick={() => setShowAllReplies(true)}
						size="sm"
						type="button"
						variant="outline"
					>
						Load {remainingCount} more{" "}
						{remainingCount === 1 ? "reply" : "replies"}
					</Button>
				</div>
			)}
		</div>
	);
}

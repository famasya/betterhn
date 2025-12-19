import {
	InformationCircleIcon,
	Loading03FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { CommentItem as CommentItemType } from "~/functions/load-comments";
import { useInfiniteComments } from "~/lib/hooks/use-infinite-comments";
import { Button } from "../ui/button";
import { CommentItem } from "./comment-item";

type CommentsProps = {
	postId: number;
	initialComments: CommentItemType[];
	remainingCommentSlices: number[][];
	totalComments: number;
	commentIds?: number[];
};

export default function Comments({
	postId,
	initialComments,
	remainingCommentSlices,
	totalComments,
	commentIds,
}: CommentsProps) {
	const {
		comments,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
		failedCount,
	} = useInfiniteComments({
		initialComments,
		remainingCommentSlices,
		postId,
		commentIds,
	});

	if (error && comments.length === 0) {
		return (
			<div className="px-3 sm:px-4">
				<div className="mb-4 font-medium text-base sm:text-lg dark:text-white">
					Comments
				</div>
				<div className="text-red-600 dark:text-red-300">
					Failed to load comments
				</div>
			</div>
		);
	}

	if (isLoading && comments.length === 0) {
		return (
			<div className="px-3 sm:px-4">
				<div className="mb-4 font-medium text-base sm:text-lg">Comments</div>
				<div className="flex items-center gap-2 text-gray-500">
					<HugeiconsIcon
						className="animate-spin"
						icon={Loading03FreeIcons}
						size={16}
					/>
					Loading comments...
				</div>
			</div>
		);
	}

	if (comments.length === 0) {
		return (
			<div className="px-3 sm:px-4">
				<div className="mb-4 font-medium text-base sm:text-lg">Comments</div>
				<div className="text-gray-500">No comments yet.</div>
			</div>
		);
	}

	return (
		<div className="px-3 sm:px-4">
			<div className="mb-4 font-medium text-base sm:text-lg">
				Comments ({totalComments})
				{failedCount > 0 && (
					<span className="ml-2 text-orange-600 text-sm">
						({failedCount} failed to load)
					</span>
				)}
			</div>
			<div className="space-y-1">
				{comments
					.filter((comment) => !comment.deleted)
					.map((comment) => (
						<CommentItem comment={comment} key={comment.id} />
					))}
			</div>

			{/* Load More Button */}
			{hasNextPage ? (
				<div className="my-4 border-gray-200 text-center">
					<Button
						className="w-full max-w-lg"
						disabled={isFetchingNextPage}
						onClick={() => fetchNextPage()}
						size="sm"
						type="button"
						variant="orange"
					>
						{isFetchingNextPage ? (
							<HugeiconsIcon
								className="animate-spin"
								icon={Loading03FreeIcons}
								size={16}
							/>
						) : (
							"Load More Comments"
						)}
					</Button>
				</div>
			) : (
				<div className="my-4 border-gray-200 text-center text-gray-500 text-sm dark:border-white/20 dark:text-gray-400">
					That's all
				</div>
			)}

			{/* Error State */}
			{error ? (
				<div className="mt-4 pt-3">
					<div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-red-700 text-sm dark:border-orange-800/50 dark:bg-orange-800/50 dark:hover:bg-orange-800/50 dark:hover:text-orange-200">
						<HugeiconsIcon icon={InformationCircleIcon} size={16} />
						<div>
							<div className="font-medium">Failed to load more comments</div>
							<div className="text-red-600 text-xs">
								Some comments may be temporarily unavailable
							</div>
						</div>
						{fetchNextPage ? (
							<button
								className="ml-auto rounded border border-red-300 bg-red-100 px-2 py-1 text-xs hover:bg-red-200"
								onClick={() => fetchNextPage()}
								type="button"
							>
								Retry
							</button>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
}

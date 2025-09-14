import {
	Comment01FreeIcons,
	InformationCircleIcon,
	Loading03FreeIcons,
	UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { formatRelative } from "date-fns";
import { useState } from "react";
import type { CommentItem as CommentItemType } from "~/functions/load-comments";
import { useInfiniteComments } from "~/lib/hooks/use-infinite-comments";

type CommentsProps = {
	postId: number;
	initialComments: CommentItemType[];
	remainingCommentSlices: number[][];
	totalComments: number;
};

function CommentReplies({
	commentIds,
	depth,
}: {
	commentIds: number[];
	depth: number;
}) {
	// Keep existing pattern for nested replies - they load all at once since they're typically smaller
	const { data, isLoading, error } = useQuery({
		queryKey: ["comment-replies", commentIds.sort().join(",")],
		queryFn: async () => {
			const { loadComments } = await import("~/functions/load-comments");
			const result = await loadComments({ data: commentIds });
			return result;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});

	if (isLoading) {
		return (
			<div className="ml-4 border-gray-200 border-l py-2 pl-4">
				<div className="flex items-center gap-2 text-gray-500 text-sm">
					<HugeiconsIcon
						className="animate-spin"
						icon={Loading03FreeIcons}
						size={14}
					/>
					Loading replies...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="ml-4 border-gray-200 border-l py-2 pl-4">
				<div className="text-red-600 text-sm">Failed to load replies</div>
			</div>
		);
	}

	const comments = data?.comments || [];

	return (
		<div className="ml-4 border-gray-200 border-l pl-4">
			{comments.map((comment) => (
				<CommentItem comment={comment} depth={depth + 1} key={comment.id} />
			))}
		</div>
	);
}

function CommentItem({
	comment,
	depth = 0,
}: {
	comment: CommentItemType;
	depth?: number;
}) {
	const [showReplies, setShowReplies] = useState(false);
	const hasReplies = comment.kids && comment.kids.length > 0;
	const maxDepth = 4;

	const handleToggleReplies = () => {
		setShowReplies(!showReplies);
	};

	return (
		<div>
			<div className="border-gray-100 border-b py-3">
				<div className="mb-2 flex items-center gap-2 text-gray-600 text-xs">
					<HugeiconsIcon icon={UserSquareIcon} size={14} />
					<span className="font-medium">{comment.by}</span>
					<span>•</span>
					<span>{formatRelative(comment.time * 1000, Date.now())}</span>
					{hasReplies && (
						<>
							<span>•</span>
							<button
								className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
								onClick={handleToggleReplies}
								type="button"
							>
								<HugeiconsIcon icon={Comment01FreeIcons} size={14} />
								<span>
									{comment.kids?.length}{" "}
									{comment.kids?.length === 1 ? "reply" : "replies"}
								</span>
							</button>
						</>
					)}
				</div>
				<div
					className="text-gray-800 text-sm leading-relaxed [&_a]:break-words [&_a]:text-orange-600 [&_a]:underline [&_a]:hover:text-orange-700 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_p:last-child]:mb-0 [&_p]:mb-2 [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: ignored
					dangerouslySetInnerHTML={{ __html: comment.text }}
				/>
			</div>

			{showReplies && hasReplies && depth < maxDepth && comment.kids && (
				<CommentReplies commentIds={comment.kids} depth={depth} />
			)}

			{showReplies && depth >= maxDepth && hasReplies && (
				<div className="ml-4 border-gray-200 border-l py-2 pl-4">
					<div className="text-gray-500 text-sm">
						Thread continues... ({comment.kids?.length} more replies)
					</div>
				</div>
			)}
		</div>
	);
}

export default function Comments({
	postId,
	initialComments,
	remainingCommentSlices,
	totalComments,
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
	});

	if (error && comments.length === 0) {
		return (
			<div className="p-4">
				<div className="mb-4 font-medium text-lg">Comments</div>
				<div className="text-red-600">Failed to load comments</div>
			</div>
		);
	}

	if (isLoading && comments.length === 0) {
		return (
			<div className="p-4">
				<div className="mb-4 font-medium text-lg">Comments</div>
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
			<div className="p-4">
				<div className="mb-4 font-medium text-lg">Comments</div>
				<div className="text-gray-500">No comments yet.</div>
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="mb-4 font-medium text-lg">
				Comments ({totalComments})
				{failedCount > 0 && (
					<span className="ml-2 text-orange-600 text-sm">
						({failedCount} failed to load)
					</span>
				)}
			</div>
			<div className="space-y-1">
				{comments.map((comment) => (
					<CommentItem comment={comment} key={comment.id} />
				))}
			</div>

			{/* Load More Button */}
			{hasNextPage && (
				<div className="mt-4 border-gray-200 border-t pt-3">
					<button
						className="flex w-full items-center justify-center rounded-sm border border-orange-200 bg-orange-100 py-2 font-medium text-orange-700 text-sm transition-colors hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isFetchingNextPage}
						onClick={() => fetchNextPage()}
						type="button"
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
					</button>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="mt-4 border-gray-200 border-t pt-3">
					<div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
						<HugeiconsIcon icon={InformationCircleIcon} size={16} />
						<div>
							<div className="font-medium">Failed to load more comments</div>
							<div className="text-red-600 text-xs">
								Some comments may be temporarily unavailable
							</div>
						</div>
						{fetchNextPage && (
							<button
								className="ml-auto rounded border border-red-300 bg-red-100 px-2 py-1 text-xs hover:bg-red-200"
								onClick={() => fetchNextPage()}
								type="button"
							>
								Retry
							</button>
						)}
					</div>
				</div>
			)}

			{/* That's All State */}
			{!(hasNextPage || error) && remainingCommentSlices.length > 0 && (
				<div className="mt-4 border-gray-200 border-t pt-3 text-center text-gray-500 text-sm">
					That's all
				</div>
			)}
		</div>
	);
}

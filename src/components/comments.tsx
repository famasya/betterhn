import {
	Comment01FreeIcons,
	InformationCircleIcon,
	Loading03FreeIcons,
	UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { formatRelative } from "date-fns";
import DOMPurify from "dompurify";
import { memo, useState } from "react";
import {
	type CommentItem as CommentItemType,
	loadComments,
} from "~/functions/load-comments";
import { useInfiniteComments } from "~/lib/hooks/use-infinite-comments";
import { Button } from "./ui/button";

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
		queryKey: [
			"comment-replies",
			{ ids: [...commentIds].sort((a, b) => a - b) },
		],
		queryFn: async () => {
			const result = await loadComments({ data: commentIds });
			return result;
		},
		enabled: commentIds.length > 0,
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
						size={16}
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

const CommentItem = memo(function CommentItemComponent({
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
			<div className="border-gray-200 border-b py-3 dark:border-white/20">
				<div className="mb-2 flex items-center gap-3 text-gray-600 text-sm">
					<div className="flex items-center gap-1 font-medium">
						<HugeiconsIcon icon={UserSquareIcon} size={18} />
						<a
							className="text-blue-600 no-underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							href={`https://news.ycombinator.com/user?id=${comment.by}`}
							target="_blank"
							title={comment.by}
						>
							{comment.by}
						</a>
					</div>
					<div className="flex items-center gap-1 dark:text-gray-400">
						[ {formatRelative(comment.time * 1000, Date.now())} ]
					</div>
				</div>
				<div
					className="comment-item"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: ignored
					dangerouslySetInnerHTML={{
						__html:
							typeof window !== "undefined"
								? DOMPurify.sanitize(comment.text, {
										USE_PROFILES: { html: true },
										ADD_ATTR: ["target"],
										ALLOWED_ATTR: ["href", "target", "rel"],
									})
								: comment.text, // Server-side: use original text, sanitize on client
					}}
				/>
				<div className="mt-2 flex items-center justify-end gap-1 text-gray-600 text-xs">
					{hasReplies && (
						<Button
							className="flex cursor-pointer items-center gap-1 text-orange-600 text-xs hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200"
							onClick={handleToggleReplies}
							size={"sm"}
							type="button"
							variant={"ghost"}
						>
							<HugeiconsIcon icon={Comment01FreeIcons} size={14} />
							<span>
								{comment.kids?.length}{" "}
								{comment.kids?.length === 1 ? "reply" : "replies"}
							</span>
						</Button>
					)}
				</div>
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
});

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
			<div className="p-3 sm:p-4">
				<div className="mb-4 font-medium text-base sm:text-lg">Comments</div>
				<div className="text-red-600">Failed to load comments</div>
			</div>
		);
	}

	if (isLoading && comments.length === 0) {
		return (
			<div className="p-3 sm:p-4">
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
			<div className="p-3 sm:p-4">
				<div className="mb-4 font-medium text-base sm:text-lg">Comments</div>
				<div className="text-gray-500">No comments yet.</div>
			</div>
		);
	}

	return (
		<div className="p-3 sm:p-4">
			<div className="mb-4 font-medium text-base sm:text-lg">
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
				<div className="mt-4 pt-3">
					<Button
						className="w-full"
						disabled={isFetchingNextPage}
						onClick={() => fetchNextPage()}
						size={"sm"}
						type="button"
						variant={"outline"}
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
			)}

			{/* Error State */}
			{error && (
				<div className="mt-4 pt-3">
					<div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-red-700 text-sm dark:border-orange-800/50 dark:bg-orange-800/50 dark:hover:bg-orange-800/50 dark:hover:text-orange-200">
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
				<div className="mt-4 pt-3 text-center text-gray-500 text-sm">
					That's all
				</div>
			)}
		</div>
	);
}

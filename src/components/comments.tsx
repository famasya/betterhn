import {
	Comment01FreeIcons,
	CommentAdd01Icon,
	InformationCircleIcon,
	Loading03FreeIcons,
	MoveToIcon,
	UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import DOMPurify from "isomorphic-dompurify";
import { memo, useState } from "react";
import {
	type CommentItem as CommentItemType,
	loadComments,
} from "~/functions/load-comments";
import { useInfiniteComments } from "~/lib/hooks/use-infinite-comments";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

type CommentsProps = {
	postId: number;
	initialComments: CommentItemType[];
	remainingCommentSlices: number[][];
	totalComments: number;
	commentIds?: number[];
};

const borderColorLevel = (level: number) => {
	switch (level % 6) {
		case 0:
			return "dark:border-teal-400/50 border-teal-400/70";
		case 1:
			return "dark:border-green-400/50 border-teal-400/70";
		case 2:
			return "dark:border-yellow-400/50 border-yellow-400/70";
		case 3:
			return "dark:border-orange-400/50 border-orange-400/70";
		case 4:
			return "dark:border-red-400/50 border-red-400/70";
		case 5:
			return "dark:border-purple-400/50 border-purple-400/70";
		default:
			return "dark:border-teal-400/50 border-teal-400/70";
	}
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

	const comments = data?.comments || [];

	return (
		<div
			className={cn(
				"ml-4 border-l-1 border-dashed pl-4",
				borderColorLevel(depth)
			)}
		>
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

	const handleToggleReplies = () => {
		setShowReplies(!showReplies);
	};

	const commentText = comment.text;

	return (
		<>
			<div className="border-gray-200 border-b pt-3 pb-1 dark:border-white/20">
				<div className="mb-2 flex items-center gap-3 text-gray-600 text-sm">
					<div className="flex items-center gap-1 font-medium">
						<HugeiconsIcon icon={UserSquareIcon} size={18} />
						<a
							className="text-teal-600 no-underline hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
							href={`https://news.ycombinator.com/user?id=${comment.by}`}
							rel="noopener noreferrer"
							target="_blank"
							title={comment.by}
						>
							{comment.by}
						</a>
					</div>
					<div className="flex items-center gap-1 dark:text-gray-400">
						[ {formatDistanceToNow(comment.time * 1000, { addSuffix: true })} ]
					</div>
				</div>
				<div
					className="comment-item"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: ignored
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(
							comment.deleted ? "Deleted" : commentText || "",
							{
								USE_PROFILES: { html: true },
								ADD_ATTR: ["target"],
								ALLOWED_ATTR: ["href", "target", "rel"],
							}
						),
					}}
				/>
				<div className="mt-2 flex items-center justify-end gap-1 text-gray-600 text-xs">
					{comment.deleted ? (
						<Button
							className="flex items-center gap-1 text-xs dark:text-gray-400"
							disabled
							size={"sm"}
							type="button"
							variant={"ghost"}
						>
							<HugeiconsIcon icon={CommentAdd01Icon} size={14} />
							Reply
						</Button>
					) : (
						<a
							href={
								comment.deleted
									? "#"
									: `https://news.ycombinator.com/reply?id=${comment.id}&goto=item?id=${comment.parent}#${comment.id}`
							}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Button
								className="flex items-center gap-1 text-xs dark:text-gray-400"
								size={"sm"}
								type="button"
								variant={"ghost"}
							>
								<HugeiconsIcon icon={CommentAdd01Icon} size={14} />
								Reply
							</Button>
						</a>
					)}
					{hasReplies && (
						<Button
							className="flex cursor-pointer items-center gap-1 text-orange-600 text-xs hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200"
							disabled={comment.deleted}
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

			{showReplies && hasReplies && comment.kids && (
				<CommentReplies commentIds={comment.kids} depth={depth} />
			)}
		</>
	);
});

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
						size={"sm"}
						type="button"
						variant={"orange"}
					>
						{isFetchingNextPage ? (
							<HugeiconsIcon
								className="animate-spin"
								icon={Loading03FreeIcons}
								size={16}
							/>
						) : (
							<div className="flex items-center gap-2">
								<HugeiconsIcon icon={MoveToIcon} size={16} />
								<span>Load More Comments</span>
							</div>
						)}
					</Button>
				</div>
			) : (
				<div className="my-4 border-gray-200 text-center text-gray-500 text-sm dark:border-white/20 dark:text-gray-400">
					That's all
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
		</div>
	);
}

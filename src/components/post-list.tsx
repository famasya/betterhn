import {
	AnalyticsUpIcon,
	Comment01Icon,
	InformationCircleIcon,
	Loading03FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { SyntheticEvent } from "react";
import type { FirebasePostDetail } from "~/lib/types";
import { cn, lowerCaseTitle } from "~/lib/utils";
import { Button } from "./ui/button";

type Params = {
	posts: FirebasePostDetail[];
	hasNextPage?: boolean;
	category: string;
	isFetchingNextPage?: boolean;
	fetchNextPage?: () => void;
	error?: Error | null;
	activePostId?: number;
	onPostClick?: () => void;
};
export default function PostList({
	posts,
	category,
	hasNextPage,
	activePostId,
	isFetchingNextPage,
	fetchNextPage,

	error,
	onPostClick,
}: Params) {
	const navigate = useNavigate();
	return (
		<>
			{posts.map((post) => (
				// biome-ignore lint/a11y/useSemanticElements: clickable div
				<div
					className={cn(
						"w-full border-gray-200 border-b p-3 text-left text-sm hover:bg-zinc-100 dark:border-gray-700 dark:hover:bg-zinc-800",
						activePostId === post.id &&
							"border-orange-700/70 bg-orange-50 hover:bg-orange-50 dark:border-orange-700/70 dark:bg-orange-50/10 dark:hover:bg-orange-50/10"
					)}
					key={post.id}
					onClick={() => {
						onPostClick?.();
						navigate({
							params: {
								category: category || "top",
								postId: `${lowerCaseTitle(post.title)}-${post.id}`,
							},
							state: (prev) => ({ ...prev, view: "post" }),
							to: "/$category/{-$postId}",
						});
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onPostClick?.();
							navigate({
								to: "/$category/{-$postId}",
								params: {
									category: category || "top",
									postId: `${lowerCaseTitle(post.title)}-${post.id}`,
								},
							});
						}
					}}
					role="button"
					tabIndex={0}
				>
					<Link
						className="text-black hover:text-orange-700 dark:text-white dark:hover:text-orange-300"
						onClick={(e: SyntheticEvent) => {
							if (post.url) {
								e.stopPropagation();
								onPostClick?.();
							}
						}}
						params={{
							category: category || "top",
							postId: `${lowerCaseTitle(post.title)}-${post.id}`,
						}}
						rel={post.url ? "noopener noreferrer" : undefined}
						state={(prev) => ({ ...prev, view: "post" })}
						target={post.url ? "_blank" : "_self"}
						to={post.url ? post.url : "/$category/{-$postId}"}
					>
						<span>{post.title}</span>
					</Link>
					<div
						className={cn(
							"mt-1 flex items-center justify-between gap-2 text-gray-500 text-xs"
						)}
					>
						<div className="flex items-center gap-1">
							<HugeiconsIcon icon={AnalyticsUpIcon} size={16} /> {post.score}{" "}
							points
						</div>
						<div className="flex items-center gap-2">
							<Link
								className="flex items-center gap-1"
								onClick={() => {
									onPostClick?.();
								}}
								params={{
									category: category || "top",
									postId: `${lowerCaseTitle(post.title)}-${post.id}`,
								}}
								to={"/$category/{-$postId}"}
							>
								<HugeiconsIcon icon={Comment01Icon} size={16} />{" "}
								{post.descendants}
							</Link>
						</div>
					</div>
				</div>
			))}

			{hasNextPage && (
				<div className="p-3">
					<Button
						className="w-full"
						disabled={isFetchingNextPage}
						onClick={fetchNextPage}
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
							"Load More Posts"
						)}
					</Button>
				</div>
			)}

			{error && (
				<div className="border-gray-200 border-b p-3 dark:border-gray-700">
					<div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-red-700 text-sm dark:border-red-700 dark:bg-red-950 dark:text-red-300">
						<HugeiconsIcon icon={InformationCircleIcon} size={16} />
						<div>
							<div className="font-medium">Failed to load more posts</div>
							<div className="text-red-600 text-xs">
								Some posts may be temporarily unavailable
							</div>
						</div>
						{fetchNextPage && (
							<Button
								onClick={fetchNextPage}
								size={"sm"}
								type="button"
								variant={"outline"}
							>
								Retry
							</Button>
						)}
					</div>
				</div>
			)}

			{!(hasNextPage || error) && fetchNextPage && (
				<div className="p-3 text-center text-gray-500 text-sm">That's all</div>
			)}
		</>
	);
}

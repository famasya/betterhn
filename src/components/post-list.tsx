import {
	AppleStocksIcon,
	Comment01FreeIcons,
	InformationCircleIcon,
	Loading03FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { FirebasePostDetail } from "~/lib/types";
import { cn, lowerCaseTitle } from "~/lib/utils";

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
	return (
		<>
			{posts.map((post) => (
				<Link
					key={post.id}
					onClick={onPostClick}
					params={{
						category: category || "top",
						postId: `${lowerCaseTitle(post.title)}-${post.id}`,
					}}
					to={"/$category/{-$postId}"}
				>
					<div
						className={cn(
							"border-gray-200 border-b p-3 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800",
							activePostId === post.id &&
								"border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-950/80"
						)}
					>
						{post.title}
						<div
							className={cn(
								"mt-1 flex items-center justify-between gap-2 text-gray-500 text-xs"
							)}
						>
							<div className="flex items-center gap-1">
								<HugeiconsIcon icon={AppleStocksIcon} size={16} /> {post.score}{" "}
								points
							</div>
							<div className="flex items-center gap-1">
								<HugeiconsIcon icon={Comment01FreeIcons} size={16} />{" "}
								{post.descendants}
							</div>
						</div>
					</div>
				</Link>
			))}

			{hasNextPage && (
				<div className="border-gray-200 border-b p-3 dark:border-gray-700">
					<button
						className="flex w-full items-center justify-center rounded-sm border border-orange-200 bg-orange-100 py-1 font-medium text-orange-700 text-sm transition-colors hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-500 dark:bg-orange-800/30 dark:text-orange-200 dark:hover:bg-orange-800/50"
						disabled={isFetchingNextPage}
						onClick={fetchNextPage}
						type="button"
					>
						{isFetchingNextPage ? (
							<HugeiconsIcon
								className="animate-spin"
								icon={Loading03FreeIcons}
								size={16}
							/>
						) : (
							"Load More"
						)}
					</button>
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
							<button
								className="ml-auto rounded border border-red-300 bg-red-100 px-2 py-1 text-xs hover:bg-red-200 dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
								onClick={fetchNextPage}
								type="button"
							>
								Retry
							</button>
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

import {
	AnalyticsUpIcon,
	Comment01Icon,
	InformationCircleIcon,
	Loading03FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
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
	return (
		<>
			{posts.map((post) => (
				<Link
					key={post.id}
					onClick={() => {
						onPostClick?.();
						// also open link in new tab
						window.open(post.url, "_blank");
					}}
					params={{
						category: category || "top",
						postId: `${lowerCaseTitle(post.title)}-${post.id}`,
					}}
					to={"/$category/{-$postId}"}
				>
					<div
						className={cn(
							"border-gray-200 border-b p-3 text-sm hover:bg-zinc-100 dark:border-gray-700 dark:hover:bg-zinc-800",
							activePostId === post.id &&
								"border-orange-700/70 bg-orange-50 hover:bg-orange-50 dark:border-orange-700/70 dark:bg-orange-50/10 dark:hover:bg-orange-50/10"
						)}
					>
						{post.title}
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
								<div className="flex items-center gap-1">
									<HugeiconsIcon icon={Comment01Icon} size={16} />{" "}
									{post.descendants}
								</div>
							</div>
						</div>
					</div>
				</Link>
			))}

			{hasNextPage && (
				<div className="border-gray-200 border-b p-3 dark:border-gray-700">
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

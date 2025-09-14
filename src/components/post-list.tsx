import {
	AppleStocksIcon,
	Comment01FreeIcons,
	InformationCircleIcon,
	Loading03FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { FirebasePostDetail } from "~/lib/types";

type Params = {
	posts: FirebasePostDetail[];
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	fetchNextPage?: () => void;
	error?: Error | null;
};
export default function PostList({
	posts,
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	error,
}: Params) {
	// replace all non-alphanumeric characters with a dash
	const lowerCaseTitle = (title: string) =>
		title.toLowerCase().replace(/[^a-z0-9]/g, "-");

	return (
		<>
			{posts.map((post) => (
				<Link
					key={post.id}
					params={{ postId: `${lowerCaseTitle(post.title)}-${post.id}` }}
					to="/post/$postId"
				>
					<div className="border-gray-200 border-b p-3 text-sm hover:bg-gray-100">
						{post.title}

						<div className="mt-1 flex items-center justify-between gap-2 text-gray-500 text-xs">
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
				<div className="border-gray-200 border-b p-3">
					<button
						className="flex w-full items-center justify-center rounded-sm border border-orange-200 bg-orange-100 py-1 font-medium text-orange-700 text-sm transition-colors hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
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
				<div className="border-gray-200 border-b p-3">
					<div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
						<HugeiconsIcon icon={InformationCircleIcon} size={16} />
						<div>
							<div className="font-medium">Failed to load more posts</div>
							<div className="text-red-600 text-xs">
								Some posts may be temporarily unavailable
							</div>
						</div>
						{fetchNextPage && (
							<button
								className="ml-auto rounded border border-red-300 bg-red-100 px-2 py-1 text-xs hover:bg-red-200"
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

import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { algoliaFetcher } from "~/lib/fetcher";
import type {
	AlgoliaCommentApiResponse,
	AlgoliaPostApiResponse,
} from "~/lib/types";
import { lowerCaseTitle } from "~/lib/utils";
import { Button } from "./ui/button";

export default function Recents() {
	const { pathname } = useLocation();
	const category = pathname.split("/")[1] || "top";
	const { data: recentPosts, isLoading } = useQuery({
		queryKey: ["recents"],
		queryFn: async () => {
			return await algoliaFetcher
				.get("search_by_date?tags=story")
				.json<AlgoliaPostApiResponse>();
		},
	});
	const { data: activePosts, isLoading: activePostsLoading } = useQuery({
		queryKey: ["active-posts"],
		queryFn: async () => {
			const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
			return await algoliaFetcher
				.get(
					`search_by_date?tags=comment&numericFilters=created_at_i>${oneHourAgo}`
				)
				.json<AlgoliaCommentApiResponse>();
		},
	});
	return (
		<div className="mt-8">
			<div>Or browse recents submissions</div>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{isLoading ? (
					<RecentsSkeleton />
				) : (
					<RecentsList category={category} posts={recentPosts?.hits || []} />
				)}
			</div>

			<div className="mt-8">Or active discussions</div>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{activePostsLoading ? (
					<RecentsSkeleton />
				) : (
					<RecentCommentsList
						category={category}
						comments={activePosts?.hits || []}
					/>
				)}
			</div>
		</div>
	);
}

function RecentsSkeleton() {
	return Array.from({ length: 6 }).map((_, index) => (
		<div
			className="mt-2 h-40 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-white/10"
			key={index.toString()}
		/>
	));
}

function RecentsList({
	posts,
	category,
}: {
	posts: AlgoliaPostApiResponse["hits"];
	category: string;
}) {
	return posts.slice(0, 6).map((post) => (
		<div
			className="mt-2 flex w-full flex-col rounded-lg border border-zinc-200 bg-zinc-100 p-2 text-sm dark:border-gray-800 dark:bg-white/10 dark:text-gray-200"
			key={post.objectID}
		>
			<div className="mb-2 flex-grow">
				{post.url ? (
					<Link
						className="hover:text-orange-700 dark:hover:text-orange-300"
						rel="noopener noreferrer"
						target="_blank"
						to={post.url}
					>
						<h1>{post.title}</h1>
					</Link>
				) : (
					<h1>{post.title}</h1>
				)}
			</div>
			<div className="text-xs">
				<p>
					{formatDistanceToNow(post.created_at_i * 1000, { addSuffix: true })}
				</p>
				<Link
					params={{
						postId: `${lowerCaseTitle(post.title)}-${post.objectID}`,
						category,
					}}
					search={{ view: "post" }}
					to="/$category/{-$postId}"
				>
					<Button className="mt-2 w-full" size="sm" variant="outline">
						View Post
					</Button>
				</Link>
			</div>
		</div>
	));
}

function RecentCommentsList({
	comments,
	category,
}: {
	comments: AlgoliaCommentApiResponse["hits"];
	category: string;
}) {
	return comments.slice(0, 6).map((comment) => (
		<div
			className="mt-2 flex w-full flex-col rounded-lg border border-zinc-200 bg-zinc-100 p-2 text-sm dark:border-gray-800 dark:bg-white/10 dark:text-gray-200"
			key={comment.objectID}
		>
			<div className="mb-2 flex-grow">
				{comment.story_url ? (
					<Link
						className="hover:text-orange-700 dark:hover:text-orange-300"
						rel="noopener noreferrer"
						target="_blank"
						to={comment.story_url}
					>
						<h1>{comment.story_title || "HN Discussions"}</h1>
					</Link>
				) : (
					<h1>{comment.story_title || "HN Discussions"}</h1>
				)}
			</div>
			<div className="text-xs">
				<p>
					{formatDistanceToNow(comment.created_at_i * 1000, {
						addSuffix: true,
					})}
				</p>
				<Link
					params={{
						postId: `${lowerCaseTitle(comment.story_title || "")}-${comment.story_id}`,
						category,
					}}
					search={{ view: "post" }}
					to="/$category/{-$postId}"
				>
					<Button className="mt-2 w-full" size="sm" variant="outline">
						View Post
					</Button>
				</Link>
			</div>
		</div>
	));
}

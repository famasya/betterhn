import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import DesktopNav from "~/components/desktop-nav";
import MainContent from "~/components/main-content";
import MobileNav from "~/components/mobile-nav";
import PostList from "~/components/post-list";
import { Skeleton } from "~/components/ui/skeleton";
import { fetchPosts } from "~/lib/fetch-posts";
import { useInfinitePosts } from "~/lib/hooks/use-infinite-posts";
import { userSettingsStore } from "~/lib/user-settings";
import { cn, lowerCaseTitle } from "~/lib/utils";

export const Route = createFileRoute("/_app/$category/")({
	loader: async ({ params: { category }, context: { queryClient } }) => {
		const postsData = await queryClient.ensureQueryData({
			queryKey: ["posts", category],
			queryFn: async ({ signal }) => {
				const { first10, remainingItems } = await fetchPosts(category, {
					signal,
				});

				for (const post of first10) {
					queryClient.setQueryData(
						["post", `${lowerCaseTitle(post.title)}-${post.id}`],
						{
							post,
							initialComments: [],
							remainingCommentSlices: [],
						}
					);
				}

				return {
					first10,
					remainingItems,
					category,
				};
			},
		});

		return {
			...postsData,
		};
	},
	component: RouteComponent,
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
});

function RouteComponent() {
	const { category, first10, remainingItems } = Route.useLoaderData();

	const view = useRouterState({
		select: (state) => state.location.state?.view,
	});
	const compactMode = useStore(userSettingsStore, (state) => state.compactMode);

	const {
		posts,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfinitePosts({
		category,
		initialPosts: first10,
		remainingItems,
	});

	const [isMobilePostsOpen, setIsMobilePostsOpen] = useState(false);

	useEffect(() => {
		setIsMobilePostsOpen(view === "nav");
	}, [view]);

	return (
		<div
			className={cn(
				"flex h-dvh flex-col overflow-hidden overscroll-contain bg-zinc-50 md:flex-row dark:bg-black",
				compactMode &&
					"mx-auto w-full max-w-6xl border-black/20 border-r border-l dark:border-white/20"
			)}
		>
			{/* Mobile Posts Overlay */}
			{isMobilePostsOpen && (
				<div className="fixed top-0 right-0 bottom-16 left-0 z-40 h-[calc(100dvh-3.3rem)] md:hidden">
					{/* Posts Container */}
					<div className="absolute top-0 right-0 bottom-16 left-0 h-full bg-white dark:bg-zinc-900">
						<div className="flex h-full flex-col">
							<div className="flex items-center justify-between border-gray-200 border-b p-2 dark:border-zinc-800">
								<h2 className="px-1 font-medium text-lg">
									{category.charAt(0).toUpperCase() + category.slice(1)}
								</h2>
							</div>
							<div className="flex-1 overflow-y-auto overscroll-contain">
								{isLoading ? (
									<LoadingPosts />
								) : (
									<PostList
										category={category}
										error={error}
										fetchNextPage={fetchNextPage}
										hasNextPage={hasNextPage}
										isFetchingNextPage={isFetchingNextPage}
										posts={posts}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Desktop Posts sidebar */}
			<div className="hidden flex-col border-gray-200 border-r bg-white md:flex dark:border-zinc-800 dark:bg-zinc-900">
				<DesktopNav
					category={category}
					isLoadingCategory={isLoading ? category : null}
					postId=""
				/>
			</div>

			<div className="hidden w-1/4 min-w-[300px] overflow-y-auto overscroll-contain border-gray-200 border-r bg-white md:block dark:border-zinc-800 dark:bg-zinc-900">
				{isLoading ? (
					<LoadingPosts />
				) : (
					<PostList
						category={category}
						error={error}
						fetchNextPage={fetchNextPage}
						hasNextPage={hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						posts={posts}
					/>
				)}
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-hidden">
				<MainContent category={category} post={null} />
			</div>

			<MobileNav
				category={category}
				isLoadingCategory={isLoading ? category : null}
				postId=""
			/>
		</div>
	);
}

function LoadingPosts() {
	return (
		<div className="flex flex-col items-center justify-center gap-2">
			{Array.from({ length: 10 }).map((_, index) => (
				<div
					className="flex w-full flex-col gap-2 border-gray-200 border-b p-2 dark:border-zinc-800"
					key={index.toString()}
				>
					<Skeleton className="h-10 w-full rounded-md" />
					<Skeleton className="h-4 w-3/4 rounded-md" />
				</div>
			))}
		</div>
	);
}

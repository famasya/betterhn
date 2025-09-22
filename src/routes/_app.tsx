import { Loading03Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import { z } from "zod";
import MobileNav from "~/components/mobile-nav";
import NavLinks from "~/components/nav-links";
import PostList from "~/components/post-list";
import SettingsDialog from "~/components/settings";
import { Button } from "~/components/ui/button";
import { fetchPosts } from "~/lib/fetch-posts";
import { useInfinitePosts } from "~/lib/hooks/use-infinite-posts";
import { userSettingsStore } from "~/lib/user-settings";
import { cn, lowerCaseTitle } from "~/lib/utils";

const searchSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().int().optional(),
	tags: z.enum(["story", "show_hn", "ask_hn", "front_page"]).optional(),
});

export const Route = createFileRoute("/_app")({
	loader: async ({ location, context: { queryClient }, abortController }) => {
		const category = location.pathname.split("/")[1] || "top";
		const postsData = await queryClient.ensureQueryData({
			queryKey: ["posts", category],
			queryFn: async () => {
				const { first10, remainingItems } = await fetchPosts(category, {
					signal: abortController.signal,
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
	validateSearch: (search) => searchSchema.parse(search),
	component: RouteComponent,
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
});

function RouteComponent() {
	const { pathname } = useLocation();
	const view = useRouterState({
		select: (state) => state.location.state?.view,
	});
	const paths = pathname.split("/");
	const category = paths[1];
	const postId = paths[2] || "";
	const activePostId = postId?.split("-").pop();
	const loaderData = Route.useLoaderData();
	const compactMode = useStore(userSettingsStore, (state) => state.compactMode);

	// Use loader data as initial data only if it matches current category
	const useLoaderData = loaderData.category === category;

	const {
		posts,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetching,
		isLoading,
		error,
	} = useInfinitePosts({
		category,
		initialPosts: useLoaderData ? loaderData.first10 : [],
		remainingItems: useLoaderData ? loaderData.remainingItems : [],
	});
	const [isMobilePostsOpen, setIsMobilePostsOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		setIsMobilePostsOpen(view === "nav");
	}, [view]);

	return (
		<div
			className={cn(
				"flex h-dvh flex-col overflow-hidden bg-zinc-50 md:flex-row dark:bg-black",
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
								<div className="flex items-center gap-2">
									<Button
										onClick={() =>
											navigate({
												to: ".",
												search: (prev) => ({
													...prev,
												}),
											})
										}
										size={"icon"}
										title="Search"
										type="button"
										variant={"outline"}
									>
										<HugeiconsIcon icon={SearchIcon} size={16} />
									</Button>
									<SettingsDialog />
								</div>
							</div>
							<div className="flex-1 overflow-y-auto">
								{isLoading ? (
									<div className="flex items-center justify-center p-4">
										<div className="flex items-center gap-2 text-gray-500 text-sm">
											<HugeiconsIcon
												className="animate-spin"
												icon={Loading03Icon}
												size={16}
											/>
											Loading posts...
										</div>
									</div>
								) : (
									<PostList
										activePostId={Number(activePostId)}
										category={category}
										error={error}
										fetchNextPage={fetchNextPage}
										hasNextPage={hasNextPage}
										isFetchingNextPage={isFetchingNextPage}
										onPostClick={() =>
											navigate({
												to: ".",
												search: (prev) => ({
													...prev,
												}),
											})
										}
										posts={posts}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Desktop Posts sidebar */}
			<div className="hidden border-gray-200 border-r bg-white md:block dark:border-zinc-800 dark:bg-zinc-900">
				<NavLinks category={category} postId={postId} />
			</div>

			<div className="hidden w-1/4 min-w-[300px] overflow-y-auto border-gray-200 border-r bg-white md:block dark:border-zinc-800 dark:bg-zinc-900">
				{isLoading ? (
					<div className="flex items-center justify-center p-4">
						<div className="flex items-center gap-2 text-gray-500 text-sm">
							<HugeiconsIcon
								className="animate-spin"
								icon={Loading03Icon}
								size={16}
							/>
							Loading posts...
						</div>
					</div>
				) : (
					<PostList
						activePostId={Number(activePostId)}
						category={category}
						error={error}
						fetchNextPage={fetchNextPage}
						hasNextPage={hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						onPostClick={() =>
							navigate({
								to: ".",
								search: (prev) => ({
									...prev,
								}),
							})
						}
						posts={posts}
					/>
				)}
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-hidden">
				<Outlet />
			</div>

			<MobileNav
				category={category}
				isLoadingCategory={isFetching ? category : null}
				onNavigate={() =>
					navigate({
						to: ".",
						search: (prev) => ({
							...prev,
						}),
					})
				}
			/>
		</div>
	);
}

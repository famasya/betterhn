import { SearchIcon } from "@hugeicons/core-free-icons";
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
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useInfinitePosts } from "~/lib/hooks/use-infinite-posts";
import { userSettingsStore } from "~/lib/user-settings";
import { cn } from "~/lib/utils";

const searchSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().int().optional(),
	tags: z.enum(["story", "show_hn", "ask_hn", "front_page"]).optional(),
});

export const Route = createFileRoute("/_app")({
	validateSearch: (search) => searchSchema.parse(search),
	component: RouteComponent,
});

function RouteComponent() {
	const { pathname } = useLocation();
	const view = useRouterState({
		select: (state) => state.location.state?.view,
	});
	const paths = pathname.split("/");
	const category = paths[1] || "top";
	const postId = paths[2] || "";
	const activePostId = postId?.split("-").pop();
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
							</div>
							<div className="flex-1 overflow-y-auto">
								{isLoading ? (
									<LoadingPosts />
								) : (
									<PostList
										activePostId={
											activePostId ? Number(activePostId) : undefined
										}
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
			<div className="flex hidden flex-col border-gray-200 border-r bg-white md:block dark:border-zinc-800 dark:bg-zinc-900">
				<NavLinks
					category={category}
					isLoadingCategory={isLoading ? category : null}
					postId={postId}
				/>
				<div className="flex w-full items-center justify-center">
					<Button
						onClick={() =>
							navigate({
								to: "/$category",
								params: {
									category,
								},
								search: (prev) => prev,
								state: (prev) => ({ ...prev, view: "post" }),
							})
						}
						variant={"ghost"}
					>
						<HugeiconsIcon icon={SearchIcon} />
					</Button>
				</div>
			</div>

			<div className="hidden w-1/4 min-w-[300px] overflow-y-auto border-gray-200 border-r bg-white md:block dark:border-zinc-800 dark:bg-zinc-900">
				{isLoading ? (
					<LoadingPosts />
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
				isLoadingCategory={isLoading ? category : null}
				postId={postId}
			/>
		</div>
	);
}

function LoadingPosts() {
	return (
		<div className="flex flex-col items-center justify-center gap-2 p-4">
			{Array.from({ length: 10 }).map((_, index) => (
				<div
					className="flex w-full flex-col gap-2 border-gray-200 border-b pb-2 dark:border-zinc-800"
					key={index.toString()}
				>
					<Skeleton className="h-10 w-full rounded-md" />
					<Skeleton className="h-4 w-3/4 rounded-md" />
				</div>
			))}
		</div>
	);
}

import {
	Cancel01Icon,
	Loading03Icon,
	Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import NavLinks from "~/components/nav-links";
import PostList from "~/components/post-list";
import { Button } from "~/components/ui/button";
import { fetchPosts } from "~/lib/fetch-posts";
import { useInfinitePosts } from "~/lib/hooks/use-infinite-posts";
import { createQueryClient } from "~/lib/query-client";
import { lowerCaseTitle } from "~/lib/utils";

export const Route = createFileRoute("/_app")({
	loader: async ({ location }) => {
		const category = location.pathname.split("/")[1] || "top";
		const queryClient = createQueryClient();

		return await queryClient.ensureQueryData({
			queryKey: ["posts", category],
			queryFn: async () => {
				const { first10, remainingItems } = await fetchPosts(category);

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
	},
	component: RouteComponent,
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
});

function RouteComponent() {
	const { pathname } = useLocation();
	const paths = pathname.split("/");
	const category = paths[1];
	const postId = paths[2] || "";
	const activePostId = postId?.split("-").pop();
	const loaderData = Route.useLoaderData();

	// Use loader data as initial data only if it matches current category
	const useLoaderData = loaderData.category === category;

	const {
		posts,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = useInfinitePosts({
		category,
		initialPosts: useLoaderData ? loaderData.first10 : [],
		remainingItems: useLoaderData ? loaderData.remainingItems : [],
	});
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isMobileMenuOpen]);

	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-zinc-50 md:flex-row dark:bg-black">
			{/* Mobile Header */}
			<div className="flex items-center justify-between border-gray-200 border-b bg-white p-2 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
				<Button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setIsMobileMenuOpen(!isMobileMenuOpen);
					}}
					type="button"
					variant="outline"
				>
					<HugeiconsIcon className="pointer-events-none" icon={Menu01Icon} />
				</Button>
				<h1 className="font-semibold text-lg">hn.fd</h1>
				<div className="w-10" /> {/* Spacer for centering */}
			</div>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					{/* Backdrop */}
					{/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: clickable */}
					{/** biome-ignore lint/a11y/noStaticElementInteractions: clickable */}
					<div
						className="absolute inset-0 bg-black/60 dark:bg-black/80"
						onClick={() => setIsMobileMenuOpen(false)}
						onKeyUp={() => setIsMobileMenuOpen(false)}
					/>

					{/* Sidebar Container */}
					<div className="absolute top-0 left-0 h-full w-full">
						<div className="flex h-full">
							{/* Navigation Sidebar */}
							<div className="border-gray-200 border-r bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
								<NavLinks category={category} postId={postId} />
							</div>

							{/* Posts Sidebar */}
							<div className="flex h-full w-80 flex-col bg-white shadow-lg dark:bg-zinc-800">
								<div className="flex items-center justify-between border-gray-200 border-b p-2 dark:border-zinc-800">
									<h2 className="font-medium text-lg">Posts</h2>
									<Button
										onClick={() => setIsMobileMenuOpen(false)}
										size={"icon"}
										title="Close"
										type="button"
										variant={"outline"}
									>
										<HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
									</Button>
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
											onPostClick={() => setIsMobileMenuOpen(false)}
											posts={posts}
										/>
									)}
								</div>
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
						onPostClick={() => setIsMobileMenuOpen(false)}
						posts={posts}
					/>
				)}
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-hidden">
				<Outlet />
			</div>
		</div>
	);
}

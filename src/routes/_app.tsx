import {
	Cancel01Icon,
	FireIcon,
	Loading03Icon,
	QuestionIcon,
	RocketIcon,
	SearchIcon,
	StarIcon,
	TargetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import NavLinks from "~/components/nav-links";
import PostList from "~/components/post-list";
import { Button } from "~/components/ui/button";
import { fetchPosts } from "~/lib/fetch-posts";
import { useInfinitePosts } from "~/lib/hooks/use-infinite-posts";
import { createQueryClient } from "~/lib/query-client";
import { cn, lowerCaseTitle } from "~/lib/utils";

const mobileNavLinks = [
	{ label: "Top", href: "/top", icon: FireIcon },
	{ label: "Best", href: "/best", icon: StarIcon },
	{ label: "New", href: "/new", icon: TargetIcon },
	{ label: "Ask", href: "/ask", icon: QuestionIcon },
	{ label: "Show", href: "/show", icon: RocketIcon },
	{ label: "Search", href: "/search", icon: SearchIcon },
];

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
	const [isMobilePostsOpen, setIsMobilePostsOpen] = useState(false);

	// Prevent body scroll when mobile posts are open
	useEffect(() => {
		if (isMobilePostsOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isMobilePostsOpen]);

	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-zinc-50 md:flex-row dark:bg-black">
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
								<Button
									onClick={() => setIsMobilePostsOpen(false)}
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
										onPostClick={() => setIsMobilePostsOpen(false)}
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
						onPostClick={() => setIsMobilePostsOpen(false)}
						posts={posts}
					/>
				)}
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-hidden">
				<Outlet />
			</div>

			{/* Mobile Bottom Navigation */}
			<div className="border-gray-200 border-t bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-900">
				<nav className="flex">
					{mobileNavLinks.map((link) => (
						<Link
							className={
								"flex flex-1 flex-col items-center justify-center p-2 text-gray-700 transition-colors hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-zinc-800"
							}
							key={link.href}
							onClick={() => setIsMobilePostsOpen(true)}
							to={link.href}
						>
							<Button
								className={cn(
									"flex flex-col items-center justify-center gap-0",
									`/${category}` === link.href &&
										"bg-orange-200 text-orange-700 dark:bg-orange-800 dark:text-orange-200"
								)}
								variant={"ghost"}
							>
								<HugeiconsIcon icon={link.icon} />{" "}
								<span className="sr-only">{link.label}</span>
							</Button>
						</Link>
					))}
				</nav>
			</div>
		</div>
	);
}

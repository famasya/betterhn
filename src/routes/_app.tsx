import {
	Cancel01Icon,
	FireIcon,
	Loading03Icon,
	Menu01Icon,
	QuestionIcon,
	RocketIcon,
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
import PostList from "~/components/post-list";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { fetchPosts } from "~/lib/fetch-posts";
import { useInfinitePosts } from "~/lib/hooks/use-infinite-posts";
import { cn } from "~/lib/utils";

const navLinks = [
	{ label: "Front Page", href: "/top", icon: FireIcon },
	{ label: "Best", href: "/best", icon: StarIcon },
	{ label: "New", href: "/new", icon: TargetIcon },
	{ label: "Ask", href: "/ask", icon: QuestionIcon },
	{ label: "Show", href: "/show", icon: RocketIcon },
];

export const Route = createFileRoute("/_app")({
	loader: async ({ location }) => {
		const currentPath = location.pathname;
		const category = currentPath.split("/")[1] || "top";
		const { first10, remainingItems } = await fetchPosts(category);
		return {
			first10,
			remainingItems,
			category,
		};
	},
	component: RouteComponent,
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
});

function RouteComponent() {
	const { pathname } = useLocation();
	const paths = pathname.split("/");
	const category = paths[1];
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
		<div className="flex h-screen flex-col overflow-hidden bg-gray-50 md:flex-row">
			{/* Mobile Header */}
			<div className="flex items-center justify-between border-gray-200 border-b bg-white p-2 md:hidden">
				<button
					className="rounded-lg p-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						console.log("HAMBURGER WORKING!");
						setIsMobileMenuOpen(!isMobileMenuOpen);
					}}
					type="button"
				>
					<HugeiconsIcon
						className="pointer-events-none h-6 w-6"
						icon={Menu01Icon}
					/>
				</button>
				<h1 className="font-semibold text-lg">hn.fd</h1>
				<div className="w-10" /> {/* Spacer for centering */}
			</div>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					{/* Backdrop */}
					<div className="absolute inset-0 bg-black/60" />

					{/* Sidebar Container */}
					<div className="slide-in-from-left absolute top-0 left-0 h-full animate-in duration-300">
						<div className="flex h-full">
							{/* Navigation Sidebar */}
							<div className="w-16 border-gray-200 border-r bg-white shadow-lg">
								<nav className="space-y-2 p-2">
									<TooltipProvider>
										{navLinks.map((link) => (
											<Tooltip delayDuration={0} key={link.href}>
												<TooltipTrigger asChild>
													<Link
														className={cn(
															"flex items-center justify-center rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100",
															`/${category}` === link.href &&
																"bg-orange-200 text-orange-700 hover:bg-orange-200"
														)}
														to={link.href}
													>
														<HugeiconsIcon
															className="h-5 w-5"
															icon={link.icon}
														/>
													</Link>
												</TooltipTrigger>
												<TooltipContent side="right">
													<p>{link.label}</p>
												</TooltipContent>
											</Tooltip>
										))}
									</TooltipProvider>
								</nav>
							</div>

							{/* Posts Sidebar */}
							<div className="w-80 bg-white shadow-lg">
								<div className="flex items-center justify-between border-gray-200 border-b p-4">
									<h2 className="font-semibold text-lg">Posts</h2>
									<button
										className="rounded-lg p-2 transition-colors hover:bg-gray-100"
										onClick={() => setIsMobileMenuOpen(false)}
										title="Close"
										type="button"
									>
										<HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
									</button>
								</div>
								<ScrollArea className="h-full">
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
											category={category}
											error={error}
											fetchNextPage={fetchNextPage}
											hasNextPage={hasNextPage}
											isFetchingNextPage={isFetchingNextPage}
											onPostClick={() => setIsMobileMenuOpen(false)}
											posts={posts}
										/>
									)}
								</ScrollArea>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* sidebar navigation */}
			<div className="hidden border-gray-200 border-r bg-white md:block">
				<nav className="space-y-2 p-2">
					<TooltipProvider>
						{navLinks.map((link) => (
							<Tooltip delayDuration={0} key={link.href}>
								<TooltipTrigger asChild>
									<Link
										className={cn(
											"flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100",
											`/${category}` === link.href &&
												"bg-orange-200 text-orange-700 hover:bg-orange-200"
										)}
										to={link.href}
									>
										<HugeiconsIcon className="h-5 w-5" icon={link.icon} />
									</Link>
								</TooltipTrigger>
								<TooltipContent side="right">
									<p>{link.label}</p>
								</TooltipContent>
							</Tooltip>
						))}
					</TooltipProvider>
				</nav>
			</div>

			{/* Desktop Posts sidebar */}
			<div className="hidden w-1/4 min-w-[300px] border-gray-200 border-r bg-white md:block">
				<ScrollArea className="h-full">
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
							category={category}
							error={error}
							fetchNextPage={fetchNextPage}
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							onPostClick={() => setIsMobileMenuOpen(false)}
							posts={posts}
						/>
					)}
				</ScrollArea>
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-hidden">
				<Outlet />
			</div>
		</div>
	);
}

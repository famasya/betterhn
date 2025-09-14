import {
	FireIcon,
	Menu01Icon,
	QuestionIcon,
	RocketIcon,
	StarIcon,
	TargetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import MobileMenu from "~/components/mobile-menu";
import PostList from "~/components/post-list";
import { useInfinitePosts } from "~/lib/hooks/use-infinite-posts";
import type { FirebasePostDetail } from "~/lib/types";
import { cn } from "~/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

export const navLinks = [
	{ label: "Front Page", href: "/", icon: FireIcon },
	{ label: "Best", href: "/best", icon: StarIcon },
	{ label: "New", href: "/new", icon: TargetIcon },
	{ label: "Ask", href: "/ask", icon: QuestionIcon },
	{ label: "Show", href: "/show", icon: RocketIcon },
];

type Props = {
	children: ReactNode;
	posts?: FirebasePostDetail[];
	remainingSlices?: number[][];
	activePath: string;
};
export default function AppLayout({
	children,
	posts,
	remainingSlices,
	activePath,
}: Props) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const {
		posts: allPosts,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		error,
	} = useInfinitePosts({
		initialPosts: posts || [],
		remainingSlices: remainingSlices || [],
	});

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
					className="rounded-lg p-2 transition-colors hover:bg-gray-100"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					type="button"
				>
					<HugeiconsIcon className="h-6 w-6" icon={Menu01Icon} />
				</button>
				<h1 className="font-semibold text-lg">hn.fd</h1>
				<div className="w-10" /> {/* Spacer for centering */}
			</div>

			{/* Desktop Sidebar Navigation */}
			<div className="hidden border-gray-200 border-r bg-white md:block">
				<nav className="space-y-2 p-2">
					<TooltipProvider>
						{navLinks.map((link) => (
							<Tooltip delayDuration={0} key={link.href}>
								<TooltipTrigger asChild>
									<Link
										className={cn(
											"flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100",
											activePath === link.href &&
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

			{/* Desktop Post List */}
			<div className="hidden w-1/4 max-w-[300px] border-gray-200 border-r bg-white md:block">
				<ScrollArea className="h-full">
					<PostList
						error={error}
						fetchNextPage={fetchNextPage}
						hasNextPage={hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						posts={allPosts}
					/>
				</ScrollArea>
			</div>

			<main
				className={cn(
					"relative flex-1 bg-gray-50 transition-transform duration-300 md:transform-none",
					isMobileMenuOpen && "translate-x-80 transform"
				)}
			>
				{children}
			</main>

			<MobileMenu
				activePath={activePath}
				error={error}
				fetchNextPage={fetchNextPage}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				isMobileMenuOpen={isMobileMenuOpen}
				posts={allPosts}
				setIsMobileMenuOpen={setIsMobileMenuOpen}
			/>
		</div>
	);
}

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PostList from "~/components/post-list";
import type { FirebasePostDetail } from "~/lib/types";
import { cn } from "~/lib/utils";
import { navLinks } from "~/routes/app-layout";
import { ScrollArea } from "../components/ui/scroll-area";

type MobileMenuProps = {
	posts: FirebasePostDetail[];
	isMobileMenuOpen: boolean;
	setIsMobileMenuOpen: (open: boolean) => void;
	activePath: string;
};
export default function MobileMenu({
	posts,
	isMobileMenuOpen,
	setIsMobileMenuOpen,
	activePath,
}: MobileMenuProps) {
	return (
		<div
			className={cn(
				"fixed inset-0 z-50 transition-opacity duration-300 md:hidden",
				isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
			)}
		>
			{/* Backdrop */}
			{/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover element */}
			{/** biome-ignore lint/a11y/noStaticElementInteractions: hover element */}
			<div
				className="absolute inset-0 bg-black/50"
				onClick={() => setIsMobileMenuOpen(false)}
				onKeyDown={() => setIsMobileMenuOpen(false)}
			/>

			{/* Slide-out Sidebar */}
			<div
				className={cn(
					"absolute top-0 left-0 flex h-full w-80 flex-col bg-white shadow-xl transition-transform duration-300",
					isMobileMenuOpen
						? "translate-x-0 transform"
						: "-translate-x-full transform"
				)}
			>
				{/* Sidebar Header */}
				<div className="flex items-center justify-between border-gray-200 border-b p-4">
					<h2 className="font-semibold text-lg">hn.fd</h2>
					<button
						className="rounded-lg p-2 hover:bg-gray-100"
						onClick={() => setIsMobileMenuOpen(false)}
						type="button"
					>
						<HugeiconsIcon className="h-5 w-5" icon={Menu01Icon} />
					</button>
				</div>

				{/* Horizontal Navigation Inside Sidebar */}
				<div className="border-gray-200 border-b p-1">
					<nav className="flex items-center justify-around gap-2">
						{navLinks.map((link) => (
							<a
								className={cn(
									"flex items-center justify-center rounded-lg p-3 text-gray-700 transition-colors hover:bg-gray-100",
									activePath === link.href && "bg-orange-200 text-orange-700"
								)}
								href={link.href}
								key={link.href}
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<HugeiconsIcon className="h-5 w-5" icon={link.icon} />
							</a>
						))}
					</nav>
				</div>

				{/* Post List in Sidebar */}
				<div className="flex-1 overflow-hidden">
					<ScrollArea className="h-full">
						{/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover element */}
						{/** biome-ignore lint/a11y/noStaticElementInteractions: hover element */}
						<div
							onClick={() => setIsMobileMenuOpen(false)}
							onKeyDown={() => setIsMobileMenuOpen(false)}
						>
							<PostList posts={posts} />
						</div>
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}

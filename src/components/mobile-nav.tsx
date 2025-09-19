import {
	FireIcon,
	QuestionIcon,
	RocketIcon,
	StarIcon,
	TargetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const mobileNavLinks = [
	{ label: "Top", href: "/top", icon: FireIcon },
	{ label: "Best", href: "/best", icon: StarIcon },
	{ label: "New", href: "/new", icon: TargetIcon },
	{ label: "Ask", href: "/ask", icon: QuestionIcon },
	{ label: "Show", href: "/show", icon: RocketIcon },
];

export default function MobileNav({
	category,
	setIsMobilePostsOpen,
}: {
	category: string;
	setIsMobilePostsOpen: (open: boolean) => void;
}) {
	return (
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
								"flex cursor-pointer flex-col items-center justify-center gap-0",
								`/${category}` === link.href &&
									"cursor-pointer bg-orange-200 text-orange-700 hover:bg-orange-200 hover:text-orange-700 dark:bg-orange-800 dark:text-orange-200 dark:hover:bg-orange-800/50 dark:hover:text-orange-200"
							)}
							size={"xs"}
							variant={"ghost"}
						>
							<HugeiconsIcon icon={link.icon} />{" "}
							<span className="sr-only">{link.label}</span>
						</Button>
					</Link>
				))}
			</nav>
		</div>
	);
}

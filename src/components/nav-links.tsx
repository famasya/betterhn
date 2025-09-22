import {
	FireIcon,
	Loading03Icon,
	QuestionIcon,
	RocketIcon,
	StarIcon,
	TargetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export const navLinks = [
	{ label: "Front Page", href: "/top", icon: FireIcon, showMobile: true },
	{ label: "Best", href: "/best", icon: StarIcon, showMobile: true },
	{ label: "New", href: "/new", icon: TargetIcon, showMobile: true },
	{ label: "Ask", href: "/ask", icon: QuestionIcon, showMobile: true },
	{ label: "Show", href: "/show", icon: RocketIcon, showMobile: true },
];

type Params = {
	category: string;
	postId: string;
	isLoadingCategory: string | null;
};
export default function NavLinks({
	category,
	postId,
	isLoadingCategory,
}: Params) {
	return (
		<nav className="space-y-2 p-2">
			{navLinks.map((link) => {
				const itemCategory = link.href.split("/")[1];
				return (
					<Tooltip key={link.href}>
						<TooltipTrigger asChild>
							<Link
								className={cn(
									"flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-orange-800/50",
									`/${category}` === link.href &&
										"bg-orange-200 text-orange-700 hover:bg-orange-200 dark:bg-orange-800 dark:text-orange-300 dark:hover:bg-orange-800"
								)}
								params={{
									category: itemCategory === "search" ? category : itemCategory,
									postId: itemCategory === "search" ? undefined : postId,
								}}
								resetScroll={false}
								state={(prev) => ({ ...prev, view: "nav" })}
								to={postId.length > 0 ? "/$category/{-$postId}" : link.href}
							>
								{`/${isLoadingCategory}` === link.href ? (
									<HugeiconsIcon
										className="h-5 w-5 animate-spin"
										icon={Loading03Icon}
									/>
								) : (
									<HugeiconsIcon className={cn("h-5 w-5")} icon={link.icon} />
								)}
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>{link.label}</p>
						</TooltipContent>
					</Tooltip>
				);
			})}
		</nav>
	);
}

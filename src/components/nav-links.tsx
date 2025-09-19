import {
	FireIcon,
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
import SettingsDialog from "./settings";

const navLinks = [
	{ label: "Front Page", href: "/top", icon: FireIcon },
	{ label: "Best", href: "/best", icon: StarIcon },
	{ label: "New", href: "/new", icon: TargetIcon },
	{ label: "Ask", href: "/ask", icon: QuestionIcon },
	{ label: "Show", href: "/show", icon: RocketIcon },
];

type Params = {
	category: string;
	postId: string;
	search?: string;
	page?: number;
};
export default function NavLinks({ category, postId, search, page }: Params) {
	return (
		<nav className="space-y-2 p-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<SettingsDialog />
				</TooltipTrigger>
				<TooltipContent side="right">
					<p>hn.fd - Clean and Fast HN Reader</p>
				</TooltipContent>
			</Tooltip>
			{navLinks.map((link) => {
				const itemCategory = link.href.split("/")[1];
				return (
					<Tooltip delayDuration={0} key={link.href}>
						<TooltipTrigger asChild>
							<Link
								className={cn(
									"flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-orange-800/50 dark:hover:bg-zinc-800",
									`/${category}` === link.href &&
										"bg-orange-200 text-orange-700 hover:bg-orange-200 dark:bg-orange-800/30 dark:text-orange-300 dark:hover:bg-orange-800/50"
								)}
								params={{
									category: itemCategory === "search" ? category : itemCategory,
									postId: itemCategory === "search" ? undefined : postId,
								}}
								search={{ search, page }}
								to={postId.length > 0 ? "/$category/{-$postId}" : link.href}
							>
								<HugeiconsIcon className={cn("h-5 w-5")} icon={link.icon} />
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

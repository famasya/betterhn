import { Loading03Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { navLinks } from "./nav-links";

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
		<nav className="flex-1 space-y-2 p-2">
			<Link
				className="flex cursor-default items-center gap-3 rounded-lg bg-orange-600 p-2 text-gray-700 text-white transition-colors hover:bg-orange-700/90 dark:bg-orange-800 dark:text-gray-200 dark:hover:bg-orange-800/90"
				params={{ category }}
				search={(prev) => prev}
				state={(prev) => ({ ...prev, view: "post" })}
				to={"/$category"}
			>
				<HugeiconsIcon className="h-5 w-5" icon={SearchIcon} />
			</Link>
			{navLinks.map((link) => {
				const itemCategory = link.href.split("/")[1];
				return (
					<Tooltip key={link.href}>
						<TooltipTrigger asChild>
							<Link
								aria-busy={Boolean(
									isLoadingCategory && `/${isLoadingCategory}` === link.href
								)}
								aria-current={`/${category}` === link.href ? "page" : undefined}
								aria-label={link.label}
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
								search={(prev) => prev}
								state={(prev) => ({ ...prev, view: "nav" })}
								to={postId.length > 0 ? "/$category/$postId" : link.href}
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

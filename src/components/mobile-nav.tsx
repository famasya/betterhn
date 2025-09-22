import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { navLinks } from "./nav-links";

export default function MobileNav({
	category,
	onNavigate,
	isLoadingCategory,
}: {
	category: string;
	onNavigate: () => void;
	isLoadingCategory: string | null;
}) {
	return (
		<div className="border-gray-200 border-t bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-900">
			<nav className="flex gap-1 p-2">
				{navLinks
					.filter((link) => link.showMobile)
					.map((link) => {
						const isActive = `/${category}` === link.href;
						return (
							<Button
								asChild
								className={cn(
									"flex flex-1 flex-row items-center justify-center p-2 text-gray-700 text-xs hover:bg-zinc-100 dark:text-gray-200 dark:hover:bg-zinc-800",
									isActive &&
										"bg-orange-700 text-white hover:bg-orange-700 hover:text-white dark:bg-orange-800 dark:text-orange-200 dark:hover:bg-orange-800 dark:hover:text-orange-200"
								)}
								key={link.href}
								variant="ghost"
							>
								<Link
									aria-busy={Boolean(`/${isLoadingCategory}` === link.href)}
									aria-current={isActive ? "page" : undefined}
									onClick={() => onNavigate()}
									state={(prev) => ({ ...prev, view: "nav" })}
									to={link.href}
								>
									{`/${isLoadingCategory}` === link.href ? (
										<HugeiconsIcon
											className="animate-spin"
											icon={Loading03Icon}
											size={24}
										/>
									) : (
										<HugeiconsIcon icon={link.icon} size={24} />
									)}
									{isActive ? (
										<span aria-hidden>{link.label}</span>
									) : (
										<span className="sr-only">{link.label}</span>
									)}
								</Link>
							</Button>
						);
					})}
			</nav>
		</div>
	);
}

import {
	LeftToRightListDashIcon,
	Loading03Icon,
	SearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { navLinks } from "~/components/nav-links";
import { Button } from "~/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

export default function MobileNav({
	category,
	postId,
	isLoadingCategory,
	view,
}: {
	category: string;
	postId: string;
	isLoadingCategory: string | null;
	view: "nav" | "post";
}) {
	const navigate = useNavigate();
	return (
		<div className="flex justify-between gap-3 border-gray-200 border-t bg-white p-2 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
			<Select
				onValueChange={(value) => {
					navigate({
						to: value,
						search: (prev) => prev,
						state: (prev) => ({ ...prev, view: "nav" }),
					});
				}}
				value={`/${category}`}
			>
				<SelectTrigger className="flex flex-1 border-orange-300 bg-orange-200 text-orange-800 hover:bg-orange-200 focus:ring-orange-300 dark:border-orange-700/50 dark:bg-orange-800 dark:text-orange-200 dark:hover:bg-orange-800">
					<div className="flex w-full items-center justify-between">
						<SelectValue placeholder="Navigate" />
						{isLoadingCategory === category && (
							<HugeiconsIcon
								className="animate-spin"
								icon={Loading03Icon}
								size={20}
							/>
						)}
					</div>
				</SelectTrigger>
				<SelectContent>
					{navLinks
						.filter((link) => link.showMobile)
						.map((link) => (
							<SelectItem
								className="data-[state=checked]:bg-orange-300 data-[state=checked]:text-orange-900 dark:data-[state=checked]:bg-orange-800 dark:data-[state=checked]:text-white"
								key={link.href}
								value={link.href}
							>
								<div className="flex flex-row items-center gap-2">
									<HugeiconsIcon icon={link.icon} size={18} />
									<div>{link.label}</div>
								</div>
							</SelectItem>
						))}
				</SelectContent>
			</Select>
			<div className="flex items-center">
				<Link
					params={{ category, postId: undefined }}
					search={(prev) => prev}
					state={(prev) => {
						// if in reading post, back to search
						if (prev.view === "post" && postId !== "") {
							return {
								...prev,
								view: "nav",
							};
						}

						return {
							...prev,
							view: prev.view === "nav" ? "post" : "nav",
						};
					}}
					to={"/$category/{-$postId}"}
				>
					<Button variant={"outline"}>
						{view === "post" ? (
							<HugeiconsIcon icon={SearchIcon} />
						) : (
							<HugeiconsIcon icon={LeftToRightListDashIcon} />
						)}
					</Button>
				</Link>
			</div>
		</div>
	);
}

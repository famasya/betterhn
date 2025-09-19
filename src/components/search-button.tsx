import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function SearchButton() {
	const currentCategory = useLocation().pathname.split("/")[1];
	return (
		<Link
			params={{ category: currentCategory, postId: undefined }}
			to={"/$category/{-$postId}"}
		>
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<Button size={"sm"} variant={"outline"}>
						<HugeiconsIcon icon={SearchIcon} size={16} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Search</p>
				</TooltipContent>
			</Tooltip>
		</Link>
	);
}

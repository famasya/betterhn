import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function SearchButton() {
	const currentCategory = useLocation().pathname.split("/")[1];
	const navigate = useNavigate();
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					onClick={() => {
						navigate({
							params: {
								category: currentCategory,
							},
							to: "/$category",
						});
					}}
					size={"sm"}
					variant={"outline"}
				>
					<HugeiconsIcon icon={SearchIcon} size={16} />
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Search</p>
			</TooltipContent>
		</Tooltip>
	);
}

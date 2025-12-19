import { UserSquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type CommentHeaderProps = {
	by: string;
	time: number;
	id: number;
};

export function CommentHeader({ by, time, id }: CommentHeaderProps) {
	return (
		<div className="mb-2 flex items-center gap-3 text-gray-600 text-sm">
			<div className="flex items-center gap-1 font-medium">
				<HugeiconsIcon icon={UserSquareIcon} size={18} />
				<a
					className="text-blue-600 no-underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
					href={`https://news.ycombinator.com/user?id=${by}`}
					rel="noopener noreferrer"
					target="_blank"
					title={by}
				>
					{by}
				</a>
			</div>
			<div className="flex items-center gap-1 dark:text-gray-400">
				<Tooltip>
					<TooltipTrigger>
						[ {formatDistanceToNow(time * 1000, { addSuffix: true })} ]
					</TooltipTrigger>
					<TooltipContent>
						{new Date(time * 1000).toLocaleString()}
					</TooltipContent>
				</Tooltip>
			</div>
			<div>
				<a href={`https://news.ycombinator.com/item?id=${id}`}>#{id}</a>
			</div>
		</div>
	);
}

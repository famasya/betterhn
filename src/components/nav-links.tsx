import {
	BowlingBallIcon,
	FireIcon,
	QuestionIcon,
	RocketIcon,
	Search01Icon,
	StarIcon,
	TargetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

const navLinks = [
	{ label: "Front Page", href: "/top", icon: FireIcon },
	{ label: "Best", href: "/best", icon: StarIcon },
	{ label: "New", href: "/new", icon: TargetIcon },
	{ label: "Ask", href: "/ask", icon: QuestionIcon },
	{ label: "Show", href: "/show", icon: RocketIcon },
];

export default function NavLinks({
	category,
	postId,
}: {
	category: string;
	postId: string;
}) {
	return (
		<nav className="space-y-2 p-2">
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<SettingsDialog />
					</TooltipTrigger>
					<TooltipContent side="right">
						<p>hn.fd - Clean and Fast HN Reader</p>
					</TooltipContent>
				</Tooltip>
				{navLinks.map((link) => (
					<Tooltip delayDuration={0} key={link.href}>
						<TooltipTrigger asChild>
							<Link
								className={cn(
									"flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100",
									`/${category}` === link.href &&
										"bg-orange-200 text-orange-700 hover:bg-orange-200"
								)}
								params={{ category: link.href.split("/")[1], postId }}
								to={postId.length > 0 ? "/$category/{-$postId}" : link.href}
							>
								<HugeiconsIcon className={cn("h-5 w-5")} icon={link.icon} />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>{link.label}</p>
						</TooltipContent>
					</Tooltip>
				))}
				<Tooltip delayDuration={0}>
					<TooltipTrigger asChild>
						<Link
							className={cn(
								"flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100",
								`/${category}` === "search" &&
									"bg-orange-200 text-orange-700 hover:bg-orange-200"
							)}
							key={"search"}
							params={{ category, postId: undefined }}
							to={"/$category/{-$postId}"}
						>
							<HugeiconsIcon className={cn("h-5 w-5")} icon={Search01Icon} />
						</Link>
					</TooltipTrigger>
					<TooltipContent side="right">
						<p>Search</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</nav>
	);
}

function SettingsDialog() {
	const [darkMode, setDarkMode] = useState(false);
	return (
		<Dialog>
			<DialogTrigger className="flex items-center gap-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 p-2 text-gray-700 text-white transition-colors hover:from-blue-500 hover:to-blue-500">
				<HugeiconsIcon className={cn("h-5 w-5")} icon={BowlingBallIcon} />
			</DialogTrigger>
			<DialogContent className="duration-0">
				<DialogHeader>
					<DialogTitle>About hn.fd</DialogTitle>
					<DialogDescription className="mt-2">
						<div className="flex flex-row justify-between">
							<div>Color Mode</div>
							<div>
								<div className="flex items-center space-x-2">
									<Label className="text-xs" htmlFor="color-mode">
										{darkMode ? "Dark" : "Light"}
									</Label>
									<Switch
										checked={darkMode}
										className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
										id="color-mode"
										onCheckedChange={setDarkMode}
									/>
								</div>
							</div>
						</div>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

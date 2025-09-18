import { BowlingBallIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { cn } from "~/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export default function SettingsDialog() {
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark" || theme === "system";

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
	};
	return (
		<Dialog>
			<DialogTrigger className="flex items-center gap-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 p-2 text-gray-700 text-white transition-colors hover:from-blue-500 hover:to-blue-500">
				<HugeiconsIcon className={cn("h-5 w-5")} icon={BowlingBallIcon} />
			</DialogTrigger>
			<DialogContent className="mx-auto max-w-[calc(100vw-2rem)] rounded-md p-4 text-sm duration-0 md:mx-0 md:max-w-lg">
				<DialogHeader />
				<DialogTitle className="font-medium text-base">
					Configuration
				</DialogTitle>
				<div className="mb-6 flex flex-row items-center justify-between">
					<div>Color Schema</div>
					<div>
						<div className="flex items-center space-x-2">
							<Label className="text-xs" htmlFor="color-mode">
								{isDark ? "Dark" : "Light"}
							</Label>
							<Switch
								checked={isDark}
								className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
								id="color-mode"
								onCheckedChange={toggleTheme}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

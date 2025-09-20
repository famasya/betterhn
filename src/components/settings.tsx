import { Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useStore } from "@tanstack/react-store";
import {
	updateUserSettings,
	userSettingsStore,
	useTheme,
} from "~/lib/user-settings";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

type Params = {
	buildID: string;
};
export default function SettingsDialog({ buildID }: Params) {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const compactMode = useStore(userSettingsStore, (state) => state.compactMode);

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">
					<HugeiconsIcon icon={Settings01Icon} size={16} />
				</Button>
			</DialogTrigger>
			<DialogContent className="mx-auto max-w-[calc(100vw-2rem)] rounded-md p-4 text-sm duration-0 md:mx-0 md:max-w-lg">
				<DialogHeader>
					<DialogTitle className="font-medium text-base">
						Configuration
					</DialogTitle>
				</DialogHeader>
				<DialogDescription asChild>
					<div>
						<div className="flex flex-col gap-3">
							<div className="flex flex-row items-center justify-between">
								<div>Color Schema</div>
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
							<div className="flex flex-row items-center justify-between">
								<div>Layout Mode</div>
								<div className="flex items-center space-x-2">
									<Label className="text-xs" htmlFor="compact-mode">
										Compact
									</Label>
									<Switch
										checked={compactMode}
										className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
										id="compact-mode"
										onCheckedChange={(value) =>
											updateUserSettings("compactMode", value)
										}
									/>
								</div>
							</div>
						</div>
						<div className="mt-8 border-black/20 border-t border-dashed p-2 font-mono text-xs dark:border-white/20">
							Build: {buildID.split("-").pop()}
						</div>
					</div>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}

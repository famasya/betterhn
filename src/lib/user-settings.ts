import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { Store } from "@tanstack/react-store";
import Cookies from "js-cookie";
import z from "zod";

const settingsSchema = z.object({
	theme: z.enum(["light", "dark"]).default("light"),
	compactMode: z.boolean().default(false),
});
type UserSettings = z.infer<typeof settingsSchema>;

export const getUserSettingsFn = createIsomorphicFn()
	.server(() => {
		const cookie = getCookie("userSettings");
		return settingsSchema.parse(JSON.parse(cookie || "{}"));
	})
	.client(() => {
		const cookie = Cookies.get("userSettings");
		return settingsSchema.parse(JSON.parse(cookie || "{}"));
	});

export const userSettingsStore = new Store<UserSettings>({
	theme: "light",
	compactMode: false,
});

export const updateUserSettings = (
	key: keyof UserSettings,
	value: UserSettings[keyof UserSettings]
) =>
	userSettingsStore.setState((state) => {
		// update cookie
		Cookies.set("userSettings", JSON.stringify({ ...state, [key]: value }));
		return {
			...state,
			[key]: value,
		};
	});

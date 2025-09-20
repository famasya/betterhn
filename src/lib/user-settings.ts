import { clientOnly, createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import Cookies from "js-cookie";
import z from "zod";

const settingsSchema = z.object({
	theme: z.enum(["light", "dark"]).default("light"),
	compactMode: z.boolean().default(false),
});

export const getUserSettings = createIsomorphicFn()
	.server(() => {
		const cookie = getCookie("userSettings");
		return settingsSchema.parse(JSON.parse(cookie || "{}"));
	})
	.client(() => {
		const cookie = Cookies.get("userSettings");
		return settingsSchema.parse(JSON.parse(cookie || "{}"));
	});

export const setUserSettings = clientOnly(
	(
		key: keyof z.infer<typeof settingsSchema>,
		value: z.infer<typeof settingsSchema>[keyof z.infer<typeof settingsSchema>]
	) => {
		const existingSettings = getUserSettings();
		Cookies.set(
			"userSettings",
			JSON.stringify({ ...existingSettings, [key]: value })
		);
	}
);

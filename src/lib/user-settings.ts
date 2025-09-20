import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { Store, useStore } from "@tanstack/react-store";
import Cookies from "js-cookie";
import { useEffect } from "react";
import z from "zod";

const settingsSchema = z.object({
	theme: z.enum(["light", "dark", "system"]).default("system"),
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
	theme: "system",
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

// Theme utilities
export const getSystemTheme = createIsomorphicFn()
	.server(() => "light" as const)
	.client(() => {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? ("dark" as const)
			: ("light" as const);
	});

export const getResolvedTheme = (
	theme: UserSettings["theme"]
): "light" | "dark" => {
	if (theme === "system") {
		return getSystemTheme();
	}
	return theme;
};

export const applyTheme = createIsomorphicFn()
	.server((_theme: "light" | "dark") => {
		// No-op on server
	})
	.client((theme: "light" | "dark") => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	});

export const initializeTheme = createIsomorphicFn()
	.server(() => {
		// No-op on server
	})
	.client(() => {
		// Theme is already applied by the inline script, just set up listeners

		// Listen for system theme changes
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemThemeChange = () => {
			const currentSettings = userSettingsStore.state;
			if (currentSettings.theme === "system") {
				const newResolvedTheme = getResolvedTheme("system");
				applyTheme(newResolvedTheme);
			}
		};

		mediaQuery.addEventListener("change", handleSystemThemeChange);

		return () => {
			mediaQuery.removeEventListener("change", handleSystemThemeChange);
		};
	});

// Custom hook to replace useTheme from next-themes
export const useTheme = () => {
	const theme = useStore(userSettingsStore, (state) => state.theme);
	const resolvedTheme = getResolvedTheme(theme);

	const setTheme = (newTheme: UserSettings["theme"]) => {
		updateUserSettings("theme", newTheme);
		const newResolvedTheme = getResolvedTheme(newTheme);
		applyTheme(newResolvedTheme);
	};

	// Apply theme when it changes
	useEffect(() => {
		applyTheme(resolvedTheme);
	}, [resolvedTheme]);

	return {
		theme,
		resolvedTheme,
		setTheme,
	};
};

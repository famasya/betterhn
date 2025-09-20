import { Store } from "@tanstack/react-store";

type UserSettings = {
	theme: "dark" | "light";
	compactMode: boolean;
};

export const userSettingsStore = new Store<UserSettings>({
	theme: "light",
	compactMode: false,
});

export const updateUserSettings = (
	key: keyof UserSettings,
	value: UserSettings[keyof UserSettings]
) => {
	userSettingsStore.setState((state) => ({
		...state,
		[key]: value,
	}));
};

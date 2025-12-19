export const borderColorLevel = (level: number) => {
	switch (level % 6) {
		case 0:
			return "dark:border-blue-400/50 border-blue-400/70";
		case 1:
			return "dark:border-green-400/50 border-emerald-400/70";
		case 2:
			return "dark:border-yellow-400/50 border-yellow-400/70";
		case 3:
			return "dark:border-orange-400/50 border-orange-400/70";
		case 4:
			return "dark:border-red-400/50 border-red-400/70";
		case 5:
			return "dark:border-purple-400/50 border-purple-400/70";
		default:
			return "dark:border-teal-400/50 border-teal-400/70";
	}
};

export const INITIAL_REPLIES_LIMIT = 5;

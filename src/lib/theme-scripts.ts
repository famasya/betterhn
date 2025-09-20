export const themeScript = `
(function() {
	function getCookie(name) {
		const value = "; " + document.cookie;
		const parts = value.split("; " + name + "=");
		if (parts.length === 2) {
			return decodeURIComponent(parts.pop().split(";").shift());
		}
		return null;
	}

	let theme = 'system';
	const userSettingsCookie = getCookie('userSettings');

	if (userSettingsCookie) {
		try {
			const settings = JSON.parse(userSettingsCookie);
			theme = settings.theme || 'system';
		} catch (e) {
			// Ignore parsing errors, use default
		}
	}

	let isDark = false;
	if (theme === 'dark') {
		isDark = true;
	} else if (theme === 'system' && window.matchMedia) {
		isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	// Apply theme class immediately
	if (isDark) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
})();
	`;

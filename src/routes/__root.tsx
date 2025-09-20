/// <reference types="vite/client" />
import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import type * as React from "react";
import { useEffect } from "react";
import { DefaultCatchBoundary } from "~/components/default-catch-boundary";
import { NotFound } from "~/components/not-found";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { getBrowserQueryClient } from "~/lib/query-client";
import { themeScript } from "~/lib/theme-scripts";
import {
	getUserSettingsFn,
	initializeTheme,
	userSettingsStore,
} from "~/lib/user-settings";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title: "ZenHN - Sleek and Fast HN Reader",
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
			},
		],
	}),
	loader: () => {
		const userSettings = getUserSettingsFn();
		return { userSettings };
	},
	errorComponent: DefaultCatchBoundary,
	notFoundComponent: () => <NotFound />,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { userSettings } = Route.useLoaderData();
	userSettingsStore.setState(userSettings);

	// Initialize theme on client side
	useEffect(() => {
		const cleanup = initializeTheme();
		return cleanup;
	}, []);

	// Inline theme script that must run synchronously before any content

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/** biome-ignore lint/security/noDangerouslySetInnerHtml: theme script */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<HeadContent />
			</head>
			<body className="flex min-h-dvh flex-col">
				<QueryClientProvider client={getBrowserQueryClient()}>
					<TooltipProvider delayDuration={0}>{children}</TooltipProvider>
				</QueryClientProvider>
				<Toaster />
				<Scripts />
			</body>
		</html>
	);
}

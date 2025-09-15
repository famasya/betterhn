/// <reference types="vite/client" />
import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";
import { DefaultCatchBoundary } from "~/components/default-catch-boundary";
import { NotFound } from "~/components/not-found";
import { Toaster } from "~/components/ui/sonner";
import { queryClient } from "~/lib/query-client";
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
				title: "hn.fd - Clean and Fast HN Client",
			}),
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	errorComponent: DefaultCatchBoundary,
	notFoundComponent: () => <NotFound />,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col">
				<QueryClientProvider client={queryClient}>
					{children}
					<TanStackRouterDevtools position="bottom-right" />
				</QueryClientProvider>
				<Toaster />
				<Scripts />
			</body>
		</html>
	);
}

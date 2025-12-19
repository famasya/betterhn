import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { NotFound } from "./components/not-found";
import { createQueryClient, getBrowserQueryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		defaultPreload: "render",
		defaultErrorComponent: DefaultCatchBoundary,
		defaultNotFoundComponent: () => <NotFound />,
		scrollRestoration: true,
		context: {
			buildID: "-",
			queryClient:
				typeof window !== "undefined"
					? getBrowserQueryClient()
					: createQueryClient(),
		},
		scrollToTopSelectors: ["#post-content"],
	});

	return router;
}

declare module "@tanstack/react-router" {
	// biome-ignore lint/style/useConsistentTypeDefinitions: TanStack Router requires interface augmentation
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
	// biome-ignore lint/style/useConsistentTypeDefinitions: TanStack Router requires interface augmentation
	interface HistoryState {
		view?: "nav" | "post";
	}
}

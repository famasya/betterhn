import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { NotFound } from "./components/not-found";
import { createQueryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		defaultPreload: "render",
		defaultErrorComponent: DefaultCatchBoundary,
		defaultNotFoundComponent: () => <NotFound />,
		scrollRestoration: true,
		context: {
			buildID: "-",
			queryClient: createQueryClient(),
		},
		scrollToTopSelectors: ["#post-content"],
	});

	return router;
}

declare module "@tanstack/react-router" {
	// biome-ignore lint/nursery/useConsistentTypeDefinitions: ignored
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
	// biome-ignore lint/nursery/useConsistentTypeDefinitions: ignored
	interface HistoryState {
		view?: "nav" | "post";
	}
}

import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		defaultPreload: "render",
		defaultErrorComponent: DefaultCatchBoundary,
		defaultNotFoundComponent: () => <NotFound />,
		scrollRestoration: true,
		context: {
			buildID: process.env.WORKERS_CI_BUILD_UUID || "-",
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
}

import { createFileRoute } from "@tanstack/react-router";
import { fetchPosts } from "~/lib/fetch-posts";
import AppLayout, { navLinks } from "../components/app-layout";

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	loader: async ({ location }) => {
		console.log(location, 32_111);
		const matchRoute =
			navLinks.find((route) => route.href === location.pathname)?.href || "/";
		const { first10, remainingItems } = await fetchPosts(
			matchRoute === "/" ? "top" : matchRoute.slice(1)
		);
		return { first10, remainingItems };
	},
});

function RouteComponent() {
	const { first10, remainingItems } = Route.useLoaderData();
	return (
		<AppLayout
			activePath={"/"}
			posts={first10}
			remainingItems={remainingItems}
		/>
	);
}

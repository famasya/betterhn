import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout, { navLinks } from "../components/app-layout";
import { fetchPosts } from "../lib/fetch-posts";

export const Route = createFileRoute("/_app")({
	loader: async ({ location }) => {
		const type = location.pathname.split("/").pop();
		const { first10, slices } = await fetchPosts(type || "top");
		return { first10, slices };
	},
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
	component: RouteComponent,
});

function RouteComponent() {
	const initialData = Route.useLoaderData();
	const location = useLocation();
	const [activePath, setActivePath] = useState<string>("/");

	useEffect(() => {
		// Only update activePath if we're on a main navigation route
		const mainRoutes = navLinks.map((link) => link.href);
		const currentPath = location.pathname;

		// Check if current path matches a main route
		const matchedRoute = mainRoutes.find((route) => currentPath === route);

		if (matchedRoute) {
			setActivePath(matchedRoute);
			localStorage.setItem("lastActivePath", matchedRoute);
		} else {
			// If on a nested route (like /post/123), get from localStorage
			const stored = localStorage.getItem("lastActivePath");
			if (stored) {
				setActivePath(stored);
			}
		}
	}, [location.pathname]);

	return (
		<AppLayout
			activePath={activePath}
			posts={initialData.first10}
			remainingSlices={initialData.slices}
		>
			<Outlet />
		</AppLayout>
	);
}

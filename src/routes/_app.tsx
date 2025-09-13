import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchTopStories } from "../lib/top-stories";
import AppLayout from "./app-layout";

export const Route = createFileRoute("/_app")({
	loader: () => fetchTopStories(),
	component: RouteComponent,
});

function RouteComponent() {
	const posts = Route.useLoaderData();
	const location = useLocation();
	const [activePath, setActivePath] = useState<string>("/");

	useEffect(() => {
		// Only update activePath if we're on a main navigation route
		const mainRoutes = ["/", "/best", "/new", "/ask", "/show"];
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
		<AppLayout activePath={activePath} posts={posts}>
			<Outlet />
		</AppLayout>
	);
}

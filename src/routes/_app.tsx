import {
	createFileRoute,
	Outlet,
	useLocation,
	useMatches,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout, { navLinks } from "../components/app-layout";

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
});

function RouteComponent() {
	const location = useLocation();
	const [activePath, setActivePath] = useState<string>("/");
	const matches = useMatches();

	// Get the current route's loader data
	// Find the deepest match (leaf route) that has loader data
	const matchesWithData = matches.filter((match) => match.loaderData);
	const currentMatch = matchesWithData.at(-1);
	const loaderData = currentMatch?.loaderData || { first10: [], slices: [] };

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
			posts={loaderData?.first10}
			remainingSlices={loaderData?.slices}
		>
			<Outlet />
		</AppLayout>
	);
}

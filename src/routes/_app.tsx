import {
	createFileRoute,
	Outlet,
	useLocation,
	useMatches,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppLayout, { navLinks } from "../components/app-layout";
import type { FirebasePostDetail } from "../lib/types";

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
});

function RouteComponent() {
	const location = useLocation();
	const matches = useMatches();
	const [activePath, setActivePath] = useState<string>("/");
	const [postsData, setPostsData] = useState<{
		first10: FirebasePostDetail[];
		slices: number[][];
	}>({ first10: [], slices: [] });

	// Get data from the currently active child route
	const activeRouteData = matches.at(-1)?.loaderData as
		| { first10?: FirebasePostDetail[]; slices?: number[][] }
		| undefined;

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

	// Separate effect for posts data to ensure it always updates when activeRouteData changes
	useEffect(() => {
		const currentPath = location.pathname;

		// Update posts data if we have valid data from a main route
		if (activeRouteData?.first10 && activeRouteData?.slices) {
			// Always update posts data when new route data is available
			setPostsData({
				first10: activeRouteData.first10,
				slices: activeRouteData.slices,
			});
			// Store posts data for when we navigate to post details
			localStorage.setItem(
				"lastPostsData",
				JSON.stringify({
					first10: activeRouteData.first10,
					slices: activeRouteData.slices,
				})
			);
		} else if (currentPath.includes("/post/")) {
			// If we're on a post route and don't have current posts data, try to restore from localStorage
			const storedPostsData = localStorage.getItem("lastPostsData");
			if (storedPostsData) {
				try {
					const parsedData = JSON.parse(storedPostsData);
					setPostsData(parsedData);
				} catch (e) {
					console.warn("Failed to parse stored posts data:", e);
				}
			}
		}
	}, [activeRouteData, location.pathname]);

	return (
		<AppLayout
			activePath={activePath}
			posts={postsData.first10}
			remainingSlices={postsData.slices}
		>
			<Outlet />
		</AppLayout>
	);
}

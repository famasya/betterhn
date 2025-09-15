import { createFileRoute, useLocation } from "@tanstack/react-router";
import AppLayout from "../components/app-layout";

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
});

function RouteComponent() {
	const { pathname } = useLocation();
	return (
		<AppLayout
			activePath={pathname}
			posts={[]}
			remainingItems={[]}
		/>
	);
}

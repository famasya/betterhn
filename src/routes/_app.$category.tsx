import {
	createFileRoute,
	Outlet,
	useParentMatches,
} from "@tanstack/react-router";
import SearchSection from "~/components/search-section";

export const Route = createFileRoute("/_app/$category")({
	component: RouteComponent,
});

function RouteComponent() {
	const matches = useParentMatches();
	const { params } = matches.find((m) => m.routeId === "/_app") as unknown as {
		params: { category: string; postId?: string };
	};

	if (params.postId) {
		return <Outlet />;
	}

	return <SearchSection origin={params.category} />;
}

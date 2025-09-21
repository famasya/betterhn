import { createFileRoute, useSearch } from "@tanstack/react-router";
import SearchSection from "~/components/search-section";

export const Route = createFileRoute("/_app/best")({
	component: RouteComponent,
});

function RouteComponent() {
	const { search, page } = useSearch({ from: "/_app" });
	return <SearchSection origin="best" page={page} search={search} />;
}

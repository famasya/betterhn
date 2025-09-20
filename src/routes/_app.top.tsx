import { createFileRoute, useSearch } from "@tanstack/react-router";
import SearchSection from "~/components/search-section";

export const Route = createFileRoute("/_app/top")({
	component: RouteComponent,
});

function RouteComponent() {
	const { search, page } = useSearch({ from: "/_app" });
	return <SearchSection origin="top" page={page} search={search} />;
}

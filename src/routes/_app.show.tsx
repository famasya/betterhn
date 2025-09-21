import { createFileRoute, useSearch } from "@tanstack/react-router";
import SearchSection from "~/components/search-section";

export const Route = createFileRoute("/_app/show")({
	component: RouteComponent,
});

function RouteComponent() {
	const { search, page } = useSearch({ from: "/_app" });
	return <SearchSection origin="show" page={page} search={search} />;
}

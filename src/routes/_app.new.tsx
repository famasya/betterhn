import { createFileRoute } from "@tanstack/react-router";
import SearchSection, { searchSchema } from "~/components/search-section";

export const Route = createFileRoute("/_app/new")({
	component: RouteComponent,
	validateSearch: (search) => searchSchema.parse(search),
});

function RouteComponent() {
	const { search, page } = Route.useSearch();
	return <SearchSection origin="new" page={page} search={search} />;
}

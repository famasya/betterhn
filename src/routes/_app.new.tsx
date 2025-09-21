import { createFileRoute } from "@tanstack/react-router";
import SearchSection from "~/components/search-section";

export const Route = createFileRoute("/_app/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SearchSection origin="new" />;
}

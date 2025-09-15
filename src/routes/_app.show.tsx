import { createFileRoute } from "@tanstack/react-router";
import SearchSection from "~/components/search-section";

export const Route = createFileRoute("/_app/show")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SearchSection category="show" />;
}

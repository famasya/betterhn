import { createFileRoute } from "@tanstack/react-router";
import SearchSection from "~/components/search-section";

export const Route = createFileRoute("/_app/top")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SearchSection category="top" />;
}

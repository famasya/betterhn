import { createFileRoute } from "@tanstack/react-router";
import SearchSection from "~/components/search-section";

export const Route = createFileRoute("/_app/ask")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SearchSection category="ask" />;
}

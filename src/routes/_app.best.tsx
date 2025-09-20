import { createFileRoute } from "@tanstack/react-router";
import SearchSection, { searchSchema } from "~/components/search-section";

export const Route = createFileRoute("/_app/best")({
	component: RouteComponent,
	context: ({ context }) => ({
		buildID: context.buildID,
	}),
	validateSearch: (search) => searchSchema.parse(search),
});

function RouteComponent() {
	const { search, page } = Route.useSearch();
	const buildID = Route.useRouteContext().buildID;
	return (
		<SearchSection
			buildID={buildID}
			origin="best"
			page={page}
			search={search}
		/>
	);
}

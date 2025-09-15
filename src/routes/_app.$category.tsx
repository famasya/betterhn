import { createFileRoute } from "@tanstack/react-router";
import { fetchPosts } from "~/lib/fetch-posts";

export const Route = createFileRoute("/_app/$category")({
	loader: async ({ params }) => {
		const { first10, remainingItems } = await fetchPosts(params.category);
		console.log(params.category, 321);
		return { first10, remainingItems, category: params.category };
	},
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
	component: RouteComponent,
});

function RouteComponent() {
	const { first10, remainingItems, category } = Route.useLoaderData();
	return (
		<div className="p-2">
			<h3>hn.fd - {category}</h3>
		</div>
	);
}

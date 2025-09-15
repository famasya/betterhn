import { createFileRoute } from "@tanstack/react-router";
import { fetchPosts } from "~/lib/fetch-posts";

export const Route = createFileRoute("/_app/")({
	loader: async () => {
		const { first10, remainingItems } = await fetchPosts("top");
		return { first10, remainingItems };
	},
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-2">
			<h3>hn.fd - Top</h3>
		</div>
	);
}

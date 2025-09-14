import { createFileRoute } from "@tanstack/react-router";
import { fetchPosts } from "~/lib/fetch-posts";

export const Route = createFileRoute("/_app/best")({
	loader: async () => {
		const { first10, slices } = await fetchPosts("best");
		return { first10, slices };
	},
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
	component: Home,
});

function Home() {
	return (
		<div className="p-2">
			<h3>hn.fd - Best Stories</h3>
		</div>
	);
}

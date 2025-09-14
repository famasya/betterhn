import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/best")({
	component: Home,
});

function Home() {
	return (
		<div className="p-2">
			<h3>hn.fd - Best Stories</h3>
		</div>
	);
}

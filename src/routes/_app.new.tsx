import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/new")({
	component: Home,
});

function Home() {
	return (
		<div className="p-2">
			<h3>hn.fd - New Stories</h3>
		</div>
	);
}

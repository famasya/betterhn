import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
	component: Home,
});

function Home() {
	return (
		<div className="p-2">
			<h3>hn.fd - Top Stories</h3>
		</div>
	);
}

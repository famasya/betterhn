import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/ask")({
	component: Home,
});

function Home() {
	return (
		<div className="p-2">
			<h3>hn.fd - Ask</h3>
		</div>
	);
}

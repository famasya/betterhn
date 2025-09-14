import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/show")({
	component: Home,
});

function Home() {
	return (
		<div className="p-2">
			<h3>hn.fd - Show</h3>
		</div>
	);
}

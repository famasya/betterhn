import { createFileRoute } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_app/ask")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main
			className={cn(
				"relative flex-1 bg-gray-50 transition-transform duration-300 md:transform-none"
			)}
		>
			Ask
		</main>
	);
}

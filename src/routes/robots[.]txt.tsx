import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: async () =>
				new Response(`User-agent: *
Disallow:`),
		},
	},
});

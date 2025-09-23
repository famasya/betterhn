import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().int().optional(),
	tags: z.enum(["story", "show_hn", "ask_hn", "front_page"]).optional(),
});

export const Route = createFileRoute("/_app")({
	validateSearch: (search) => searchSchema.parse(search),
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}

import { createFileRoute } from "@tanstack/react-router";
import PostList from "~/components/post-list";
import { ScrollArea } from "~/components/ui/scroll-area";
import { fetchPosts } from "~/lib/fetch-posts";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_app/")({
	loader: async () => {
		const { first10, remainingItems } = await fetchPosts("top")
		return {
			first10,
			remainingItems,
		}
	},
	staleTime: 5 * 60 * 1000, // 5 minutes
	gcTime: 10 * 60 * 1000, // 10 minutes
	component: RouteComponent,
});

function RouteComponent() {
	const { first10, remainingItems } = Route.useLoaderData();
	return (
		<>
			<div className="hidden w-1/4 max-w-[300px] border-gray-200 border-r bg-white md:block">
				<ScrollArea className="h-full">
					<PostList
						error={null}
						fetchNextPage={undefined}
						hasNextPage={false}
						isFetchingNextPage={false}
						posts={first10}
					/>
				</ScrollArea>
			</div>

			<main
				className={cn(
					"relative flex-1 bg-gray-50 transition-transform duration-300 md:transform-none",
				)}
			>
				Top
			</main>
		</>
	);
}

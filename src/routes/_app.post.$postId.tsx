import { createFileRoute } from "@tanstack/react-router";
import { firebaseFetcher } from "../lib/fetcher";
import type { FirebasePostDetail } from "../lib/types";

export const Route = createFileRoute("/_app/post/$postId")({
	loader: ({ params: { postId } }) => {
		const postIdNum = postId.split("-").pop();
		const post = firebaseFetcher.get<FirebasePostDetail>(`item/${postIdNum}.json`).json();
		return post;
	},
	component: RouteComponent,
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData?.title || "Post",
			},
		],
	}),
	pendingComponent: () => (
		<div className="flex h-64 items-center justify-center">Loading post...</div>
	),
});

function RouteComponent() {
	const post = Route.useLoaderData();
	return (
		<div className="p-2">
			<h1>{post.title}</h1>
			<p>{post.by}</p>
		</div>
	);
}

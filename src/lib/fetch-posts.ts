import { notFound } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import type { CommentItem } from "~/functions/load-comments";
import { fetchAlgoliaJson } from "./fetcher";
import type {
	AlgoliaItemChild,
	AlgoliaPostApiResponse,
	AlgoliaSinglePostApiResponse,
	FirebasePostDetail,
} from "./types";

type FetchOptions = {
	signal?: AbortSignal;
};

const POSTS_PER_PAGE = 10;

const mapAlgoliaHitToPost = (
	hit: AlgoliaPostApiResponse["hits"][0]
): FirebasePostDetail => ({
	id: Number(hit.objectID),
	title: hit.title,
	url: hit.url || undefined,
	score: hit.points,
	by: hit.author,
	time: hit.created_at_i,
	descendants: hit.num_comments,
	type: "story",
	text: hit.story_text,
	kids: hit.children,
});

export const mapAlgoliaChildToComment = (
	child: AlgoliaItemChild
): CommentItem => ({
	by: child.author,
	id: child.id,
	kids: child.children?.map((c) => c.id) ?? [],
	parent: child.parent_id,
	text: child.text,
	time: child.created_at_i,
	type: child.type,
});

const resolveAlgoliaUrl = (type: string): string => {
	switch (type) {
		case "new":
			return `search_by_date?tags=story&hitsPerPage=${POSTS_PER_PAGE}`;
		case "ask":
			return `search_by_date?tags=ask_hn&hitsPerPage=${POSTS_PER_PAGE}`;
		case "show":
			return `search_by_date?tags=show_hn&hitsPerPage=${POSTS_PER_PAGE}`;
		case "job":
			return `search_by_date?tags=job&hitsPerPage=${POSTS_PER_PAGE}`;
		case "best":
			return `search?tags=front_page&hitsPerPage=${POSTS_PER_PAGE}`;
		case "top":
		default:
			return `search?tags=front_page&hitsPerPage=${POSTS_PER_PAGE}`;
	}
};

const fetchPostsInternal = async (
	category: string,
	page = 0,
	options?: FetchOptions
) => {
	const baseUrl = resolveAlgoliaUrl(category);
	const data = await fetchAlgoliaJson<AlgoliaPostApiResponse>(
		`${baseUrl}&page=${page}`,
		{ signal: options?.signal, cacheTtl: 30 }
	);

	return {
		posts: data.hits.map(mapAlgoliaHitToPost),
		page: data.page,
		nbPages: data.nbPages,
		hasMore: data.page < data.nbPages - 1,
	};
};

export const fetchPosts = createIsomorphicFn()
	.server(fetchPostsInternal)
	.client(fetchPostsInternal);

const fetchPostInternal = async (postId: number, options?: FetchOptions) => {
	const data = await fetchAlgoliaJson<AlgoliaSinglePostApiResponse>(
		`items/${postId}`,
		{ signal: options?.signal, cacheTtl: 60 }
	);

	if (!data) {
		throw notFound();
	}

	const post: FirebasePostDetail = {
		id: data.id,
		title: data.title,
		url: data.url || undefined,
		score: data.points,
		by: data.author,
		time: data.created_at_i,
		descendants: 0,
		type: data.type as FirebasePostDetail["type"],
		text: typeof data.text === "string" ? data.text : undefined,
		kids: data.children.map((c) => c.id),
	};

	const topLevelComments = data.children.map(mapAlgoliaChildToComment);
	post.descendants = topLevelComments.length;

	return { post, topLevelComments };
};

export const fetchPost = createIsomorphicFn()
	.server(fetchPostInternal)
	.client(fetchPostInternal);

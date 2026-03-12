import ky from "ky";

type FetchJsonOptions = {
	signal?: AbortSignal;
	cacheTtl?: number;
};

type CloudflareRequestInit = RequestInit & {
	cf?: {
		cacheEverything?: boolean;
		cacheTtl?: number;
	};
};

const FIREBASE_BASE_URL = "https://hacker-news.firebaseio.com/v0";
const ALGOLIA_BASE_URL = "https://hn.algolia.com/api/v1";

async function fetchJsonCached<T>(
	url: string,
	{ signal, cacheTtl = 60 }: FetchJsonOptions = {}
): Promise<T> {
	const response = await fetch(url, {
		headers: { accept: "application/json" },
		signal,
		cf: {
			cacheEverything: true,
			cacheTtl,
		},
	} satisfies CloudflareRequestInit);

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status} for ${url}`);
	}

	return response.json<T>();
}

export const fetchFirebaseJson = <T>(
	path: string,
	options?: FetchJsonOptions
) => {
	const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
	const cacheTtl = normalizedPath.endsWith("stories.json")
		? 30
		: normalizedPath.startsWith("item/")
			? 300
			: 60;

	return fetchJsonCached<T>(`${FIREBASE_BASE_URL}/${normalizedPath}`, {
		cacheTtl: options?.cacheTtl ?? cacheTtl,
		signal: options?.signal,
	});
};

export const fetchAlgoliaJson = <T>(
	path: string,
	options?: FetchJsonOptions
) => {
	const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
	return fetchJsonCached<T>(`${ALGOLIA_BASE_URL}/${normalizedPath}`, {
		cacheTtl: options?.cacheTtl ?? 30,
		signal: options?.signal,
	});
};

export const algoliaFetcher = ky.create({
	prefixUrl: ALGOLIA_BASE_URL,
	timeout: 10_000,
	retry: {
		limit: 1,
		methods: ["get"],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
		backoffLimit: 1000,
	},
});

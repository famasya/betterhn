import ky from "ky";

const fetcher = (input: string | URL | Request, init?: RequestInit) =>
	fetch(input, {
		...init,
		// @ts-expect-error additional properties for Cloudflare
		cf: {
			cacheTtl: 5 * 60, // 5 minutes
			cacheEverything: true,
		},
	});

export const firebaseFetcher = ky.create({
	prefixUrl: "https://hacker-news.firebaseio.com/v0",
	timeout: 10_000, // 10 seconds timeout
	fetch: fetcher,
	retry: {
		limit: 3,
		methods: ["get"],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
		backoffLimit: 3000, // 3 seconds max backoff
	},
});

export const algoliaFetcher = ky.create({
	prefixUrl: "https://hn.algolia.com/api/v1",
	timeout: 10_000, // 10 seconds timeout
	fetch: fetcher,
	retry: {
		limit: 3,
		methods: ["get"],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
		backoffLimit: 3000, // 3 seconds max backoff
	},
});

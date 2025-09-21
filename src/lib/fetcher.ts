import ky from "ky";

export const firebaseFetcher = ky.create({
	prefixUrl: "https://hacker-news.firebaseio.com/v0",
	timeout: 10_000, // 10 seconds timeout
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
	retry: {
		limit: 3,
		methods: ["get"],
		statusCodes: [408, 413, 429, 500, 502, 503, 504],
		backoffLimit: 3000, // 3 seconds max backoff
	},
});

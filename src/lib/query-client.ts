import { QueryClient } from "@tanstack/react-query";

const defaultOptions = {
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
		},
	},
} as const;

let browserQueryClient: QueryClient | undefined;

export function createQueryClient() {
	return new QueryClient(defaultOptions);
}

// Use only on the client. For SSR, call createQueryClient() per request.
export function getBrowserQueryClient() {
	if (typeof window === "undefined") {
		return createQueryClient();
	}
	if (!browserQueryClient) {
		browserQueryClient = createQueryClient();
	}
	return browserQueryClient;
}

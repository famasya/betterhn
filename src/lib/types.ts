export type AlgoliaPostApiResponse = {
	exhaustive: {
		nbHits: boolean;
		typo: boolean;
	};
	exhaustiveNbHits: boolean;
	exhaustiveTypo: boolean;
	hits: Array<{
		_highlightResult: {
			author: {
				matchLevel: string;
				matchedWords: unknown[];
				value: string;
			};
			title: {
				matchLevel: string;
				matchedWords: unknown[];
				value: string;
			};
			url: {
				matchLevel: string;
				matchedWords: unknown[];
				value: string;
			};
			story_text?: {
				matchLevel: string;
				matchedWords: unknown[];
				value: string;
			};
		};
		_tags: string[];
		author: string;
		children: number[];
		created_at: string;
		created_at_i: number;
		num_comments: number;
		objectID: string;
		points: number;
		story_id: number;
		title: string;
		updated_at: string;
		url: string | null;
		story_text?: string;
	}>;
	hitsPerPage: number;
	nbHits: number;
	nbPages: number;
	page: number;
	params: string;
	processingTimeMS: number;
	processingTimingsMS: {
		_request: {
			roundTrip: number;
		};
		total: number;
	};
	query: string;
	serverTimeMS: number;
};

export type AlgoliaCommentApiResponse = {
	exhaustive: {
		nbHits: boolean;
		typo: boolean;
	};
	exhaustiveNbHits: boolean;
	exhaustiveTypo: boolean;
	hits: Array<{
		_highlightResult: {
			author: {
				matchLevel: string;
				matchedWords: string[];
				value: string;
			};
			comment_text: {
				matchLevel: string;
				matchedWords: string[];
				value: string;
			};
			story_title: {
				matchLevel: string;
				matchedWords: string[];
				value: string;
			};
			story_url: {
				matchLevel: string;
				matchedWords: string[];
				value: string;
			};
		};
		_tags: string[];
		author: string;
		comment_text: string | null;
		created_at: string;
		created_at_i: number;
		objectID: string;
		parent_id: number | null;
		story_id: number;
		story_title: string | null;
		story_url: string | null;
		updated_at: string;
	}>;
	hitsPerPage: number;
	nbHits: number;
	nbPages: number;
	page: number;
	params: string;
	processingTimeMS: number;
	processingTimingsMS: {
		_request: {
			roundTrip: number;
		};
		afterFetch: {
			merge: {
				entries: {
					decompress: number;
					total: number;
				};
				total: number;
			};
			total: number;
		};
		fetch: {
			scanning: number;
			total: number;
		};
		total: number;
	};
	query: string;
	serverTimeMS: number;
};

export type AlgoliaSinglePostApiResponse = {
	author: string;
	children: Array<{
		author: string;
		children: Array<{
			author: string;
			children: Array<{
				author: string;
				children: unknown[];
				created_at: string;
				created_at_i: number;
				id: number;
				options: unknown[];
				parent_id: number;
				points: unknown;
				story_id: number;
				text: string;
				title: unknown;
				type: string;
				url: unknown;
			}>;
			created_at: string;
			created_at_i: number;
			id: number;
			options: unknown[];
			parent_id: number;
			points: unknown;
			story_id: number;
			text: string;
			title: unknown;
			type: string;
			url: unknown;
		}>;
		created_at: string;
		created_at_i: number;
		id: number;
		options: unknown[];
		parent_id: number;
		points: unknown;
		story_id: number;
		text: string;
		title: unknown;
		type: string;
		url: unknown;
	}>;
	created_at: string;
	created_at_i: number;
	id: number;
	options: unknown[];
	parent_id: unknown;
	points: number;
	story_id: number;
	text: unknown;
	title: string;
	type: string;
	url: string;
};

export type FirebasePostDetail = {
	by: string;
	descendants: number;
	id: number;
	kids: number[];
	score: number;
	time: number;
	title: string;
	type: "job" | "story" | "comment" | "poll" | "pollopt";
	url?: string;
	text?: string;
};

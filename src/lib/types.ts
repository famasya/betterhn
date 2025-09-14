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
		url: string;
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
	type: string;
	url?: string;
	text?: string;
};

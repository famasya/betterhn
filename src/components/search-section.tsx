import { ConfusedIcon, Monocle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { memo, useState } from "react";
import { useSearch } from "~/lib/hooks/use-search";
import type { AlgoliaPostApiResponse } from "~/lib/types";
import { lowerCaseTitle } from "~/lib/utils";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

type SearchSectionProps = {
	category: string;
};

export default function SearchSection({ category }: SearchSectionProps) {
	const [searchCategory, setSearchCategory] = useState("story");
	const [search, setSearch] = useState("");
	const [page, _setPage] = useState(0);
	const { data, isLoading } = useSearch(search, searchCategory, page);

	return (
		<ScrollArea className="mt-8 flex h-full w-full flex-col items-center">
			<div className="flex flex-col items-center">
				<h1 className="font-medium text-2xl">Search</h1>
				<p className="text-gray-500 text-sm">Powered by Algolia</p>
			</div>
			<div className="mx-auto w-full max-w-[800px] p-6 md:px-16">
				<Input
					className="bg-white"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search..."
					value={search}
				/>

				<div className="mt-4">
					<div className="mb-2 flex flex-col items-center justify-between md:flex-row">
						<div className="font-medium text-lg">Search results</div>
						<div>
							<Tabs
								defaultValue="story"
								onValueChange={(value) => setSearchCategory(value)}
							>
								<TabsList>
									<TabsTrigger className="text-xs" value="story">
										All
									</TabsTrigger>
									<TabsTrigger className="text-xs" value="show_hn">
										Show
									</TabsTrigger>
									<TabsTrigger className="text-xs" value="ask_hn">
										Ask
									</TabsTrigger>
									<TabsTrigger className="text-xs" value="front_page">
										Front Page
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</div>

					{isLoading ? (
						<LoadingSkeleton />
					) : (
						<div className="space-y-2">
							<SearchResultItem
								category={category}
								results={data}
								search={search}
							/>
						</div>
					)}
				</div>
			</div>
		</ScrollArea>
	);
}

function LoadingSkeleton() {
	return Array.from({ length: 10 }).map((_, index) => (
		<div
			className="mt-2 h-20 w-full animate-pulse rounded-lg bg-gray-200"
			key={index.toString()}
		/>
	));
}

const SearchResultItem = memo(function SearchResultItemComponent({
	results,
	category,
	search,
}: {
	results?: AlgoliaPostApiResponse;
	category: string;
	search: string;
}) {
	if (search.length === 0) {
		return (
			<div className="flex w-full items-center justify-center gap-2 text-center text-gray-500 text-sm">
				<HugeiconsIcon icon={Monocle01Icon} size={24} /> Search for something
			</div>
		);
	}
	if (results?.hits.length === 0 && search.length > 0) {
		return (
			<div className="flex w-full items-center justify-center gap-2 text-center text-gray-500 text-sm">
				<HugeiconsIcon icon={ConfusedIcon} size={24} /> No results found
			</div>
		);
	}
	return (
		<>
			{results?.hits.map((post) => {
				return (
					<div
						className="rounded-sm border border-gray-200 bg-white p-3"
						key={post.objectID}
					>
						<Link
							params={{
								category,
								postId: `${lowerCaseTitle(post.title)}-${post.objectID}`,
							}}
							to={"/$category/$postId"}
						>
							<p className="font-medium text-lg">{post.title}</p>
							<p className="mt-2 text-gray-500 text-sm">{`${post.points} points by ${post.author} ${post.created_at_i}`}</p>
						</Link>
					</div>
				);
			})}
		</>
	);
});

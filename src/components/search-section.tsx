import { ConfusedIcon, Monocle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { debounce } from "@tanstack/pacer";
import {
	Link,
	useNavigate,
	useSearch as useSearchRouter,
} from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import { memo, useCallback, useState } from "react";
import { useSearch } from "~/lib/hooks/use-search";
import type { AlgoliaPostApiResponse } from "~/lib/types";
import { cn, lowerCaseTitle } from "~/lib/utils";
import Recents from "./recents";
import SettingsDialog from "./settings";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

type SearchSectionProps = {
	origin: string;
};

export default function SearchSection({ origin }: SearchSectionProps) {
	const { tags, search, page } = useSearchRouter({ from: "/_app" });
	const [inputValue, setInputValue] = useState(search || "");
	const { data, isLoading } = useSearch();
	const navigate = useNavigate();

	const debouncedSearch = useCallback(
		debounce(
			(term: string) => {
				navigate({
					to: `/${origin}`,
					search: {
						search: term,
						page: 1,
					},
					replace: true,
				});
			},
			{
				wait: 1000,
			}
		),
		[]
	);

	return (
		<div className="flex h-full w-full flex-col items-center overflow-y-auto">
			<div className="flex w-full items-center justify-between p-2">
				<div className="rounded bg-gradient-to-br from-orange-700 to-orange-800 px-2 py-1 font-medium text-white">
					BetterHN
				</div>
				<SettingsDialog />
			</div>
			<div className="flex flex-col items-center pt-2">
				<h1 className="mb-2 flex w-full items-center justify-center gap-2 text-center text-xl">
					<HugeiconsIcon icon={Monocle01Icon} size={24} /> Search for something
				</h1>
				<p className="text-gray-500 text-sm">Powered by Algolia</p>
			</div>
			<div className="mx-auto w-full max-w-4xl p-6 md:px-16">
				<Input
					autoFocus
					className="rounded-full border border-black/10 text-lg shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-800 dark:focus-visible:ring-orange-400/30 dark:focus-visible:ring-offset-zinc-950"
					onChange={(e) => {
						setInputValue(e.target.value);
						debouncedSearch(e.target.value);
					}}
					placeholder="Search for something..."
					value={inputValue}
				/>

				<div className="mt-4" id="search-results">
					<div
						className={cn(
							"mb-2 flex flex-col items-center justify-between md:flex-row",
							(!search || search?.length === 0) && "hidden"
						)}
					>
						<div className="mb-1 font-medium text-base md:mb-0">
							Search results for{" "}
							<span className="rounded-md bg-yellow-200 px-2 dark:bg-yellow-700">
								{search}
							</span>
						</div>
						<div>
							<Tabs
								defaultValue={tags || "story"}
								onValueChange={(value) =>
									navigate({
										to: ".",
										search: {
											search: inputValue,
											page: 1,
											tags: value as
												| "story"
												| "show_hn"
												| "ask_hn"
												| "front_page",
										},
									})
								}
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
								origin={origin}
								results={data}
								search={search || ""}
							/>
						</div>
					)}
					<div
						className={cn(
							"mt-4 flex w-full items-center justify-end gap-2 text-center",
							(!search || search?.length === 0 || data?.hits.length === 0) &&
								"hidden"
						)}
					>
						<Link
							disabled={page === 1}
							hash="search-results"
							search={{ page: (page || 1) - 1, search }}
							to={"."}
						>
							<Button disabled={page === 1} size={"sm"} variant={"outline"}>
								Previous Page
							</Button>
						</Link>
						<Link
							disabled={page === data?.nbPages}
							hash="search-results"
							search={{ page: (page || 1) + 1, search }}
							to={"."}
						>
							<Button
								disabled={page === data?.nbPages}
								size={"sm"}
								variant={"outline"}
							>
								Next Page
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

function LoadingSkeleton() {
	return Array.from({ length: 10 }).map((_, index) => (
		<div
			className="mt-2 h-20 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"
			key={index.toString()}
		/>
	));
}

const SearchResultItem = memo(function SearchResultItemComponent({
	results,
	origin,
	search,
}: {
	results?: AlgoliaPostApiResponse;
	origin: string;
	search: string;
}) {
	if (search.length === 0) {
		return (
			<div>
				<Recents />
			</div>
		);
	}
	if (results?.hits.length === 0 && search.length > 0) {
		return (
			<div className="mt-8 flex w-full items-center justify-center gap-2 text-center text-gray-500 text-sm">
				<HugeiconsIcon icon={ConfusedIcon} size={24} /> No results found
			</div>
		);
	}
	return (
		<>
			{results?.hits.map((post) => {
				return (
					<div
						className="rounded-sm border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
						key={post.objectID}
					>
						<Link
							params={{
								category: origin,
								postId: `${lowerCaseTitle(post.title)}-${post.objectID}`,
							}}
							search={(prev) => prev}
							state={(prev) => ({ ...prev, view: "post" })}
							to={"/$category/$postId"}
						>
							<p className="font-medium">{post.title}</p>
							<p className="mt-2 text-gray-500 text-sm">
								{`${post.points} points by ${post.author} ${formatRelative(post.created_at_i * 1000, Date.now())}`}
							</p>
						</Link>
					</div>
				);
			})}
		</>
	);
});

import { ConfusedIcon, Monocle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { debounce } from "@tanstack/pacer";
import { Link, useNavigate } from "@tanstack/react-router";
import { formatRelative } from "date-fns";
import { memo, useCallback, useState } from "react";
import { z } from "zod";
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
	search?: string;
	page?: number;
};

export const searchSchema = z.object({
	search: z.string().optional(),
	page: z.number().optional(),
});

export default function SearchSection({
	origin,
	search,
	page,
}: SearchSectionProps) {
	const [searchCategory, setSearchCategory] = useState("story");
	const [inputValue, setInputValue] = useState(search || "");
	const { data, isLoading } = useSearch(
		search || "",
		searchCategory,
		page || 1
	);
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
				<div className="rounded bg-orange-700 px-2 py-1 font-medium text-sm text-white">
					ZenHN
				</div>
				<SettingsDialog />
			</div>
			<div className="flex flex-col items-center pt-2">
				<h1 className="font-medium text-2xl">Search</h1>
				<p className="text-gray-500 text-sm">Powered by Algolia</p>
			</div>
			<div className="mx-auto w-full max-w-[800px] p-6 md:px-16">
				<Input
					className="bg-white"
					onChange={(e) => {
						setInputValue(e.target.value);
						debouncedSearch(e.target.value);
					}}
					placeholder="Search..."
					value={inputValue}
				/>

				<div className="mt-4" id="search-results">
					<div
						className={cn(
							"mb-2 flex flex-col items-center justify-between md:flex-row",
							(!search || search?.length === 0) && "hidden"
						)}
					>
						<div className="font-medium text-base">
							Search results for{" "}
							<span className="bg-yellow-200 px-1">{search}</span>
						</div>
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
							search={{ page: (page || 1) - 1, search }}
							to={"."}
						>
							<Button disabled={page === 1} size={"sm"} variant={"outline"}>
								Previous Page
							</Button>
						</Link>
						<Link
							disabled={page === data?.nbPages}
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
			className="mt-2 h-20 w-full animate-pulse rounded-lg bg-zinc-200"
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
				<div className="mt-8 flex w-full items-center justify-center gap-2 text-center text-gray-500 text-sm">
					<HugeiconsIcon icon={Monocle01Icon} size={24} /> Search for something
				</div>
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
						className="rounded-sm border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-black/90"
						key={post.objectID}
					>
						<Link
							params={{
								category: origin,
								postId: `${lowerCaseTitle(post.title)}-${post.objectID}`,
							}}
							to={"/$category/{-$postId}"}
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

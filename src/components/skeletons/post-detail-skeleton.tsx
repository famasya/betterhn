import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";

export function PostDetailSkeleton() {
	return (
		<ScrollArea className="h-screen flex-1 bg-gray-50" id="post-content">
			{/* Post Header Skeleton */}
			<div className="border-gray-200 border-b bg-white p-4 sm:p-6">
				{/* Title Skeleton - 2-3 lines */}
				<div className="mb-3">
					<Skeleton className="mb-2 h-6 w-full sm:h-7" />
					<Skeleton className="mb-2 h-6 w-4/5 sm:h-7" />
					<Skeleton className="h-6 w-3/5 sm:h-7" />
				</div>

				{/* Metadata Row Skeleton */}
				<div className="flex flex-wrap items-center gap-3 sm:gap-4">
					{/* Author */}
					<div className="flex items-center gap-1">
						<span className="text-gray-600 text-sm">by</span>
						<Skeleton className="h-4 w-16" />
					</div>
					{/* Time */}
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-20" />
					</div>
					{/* Points */}
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-12" />
					</div>
					{/* Comments */}
					<div className="flex items-center gap-1">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-16" />
					</div>
				</div>

				{/* URL Link Skeleton - Optional, sometimes posts don't have URLs */}
				<div className="mt-3">
					<Skeleton className="h-4 w-32" />
				</div>

				{/* Post Text Content Skeleton - Optional, Ask HN posts might not have text */}
				<div className="mt-4 border-gray-200 border-t border-dashed pt-4">
					<div className="space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-11/12" />
						<Skeleton className="h-4 w-4/5" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				</div>
			</div>

			{/* Comments Section Skeleton */}
			<div className="p-3 sm:p-4">
				{/* Comments Header */}
				<div className="mb-4">
					<Skeleton className="h-6 w-32" />
				</div>

				{/* Comment Items Skeleton */}
				<div className="space-y-1">
					{Array.from({ length: 4 }).map((_, index) => (
						<CommentSkeleton key={index.toString()} />
					))}
				</div>

				{/* Load More Button Skeleton */}
				<div className="mt-4 border-gray-200 border-t pt-3">
					<Skeleton className="h-10 w-full rounded-sm" />
				</div>
			</div>
		</ScrollArea>
	);
}

function CommentSkeleton() {
	return (
		<div className="border-gray-200 border-b py-3">
			{/* Comment Header */}
			<div className="mb-2 flex items-center gap-2">
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-3 w-16" />
				<Skeleton className="h-3 w-24" />
				<Skeleton className="h-3 w-12" />
			</div>

			{/* Comment Text */}
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-3/4" />
			</div>
		</div>
	);
}

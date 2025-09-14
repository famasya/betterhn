import { Skeleton } from "./ui/skeleton";

export default function PostSkeleton() {
	return (
		<div className="h-screen bg-gray-50">
			{/* Post Header Skeleton */}
			<div className="border-gray-200 border-b bg-white p-4 sm:p-6">
				{/* Title */}
				<Skeleton className="mb-3 h-6 w-4/5 sm:h-7" />

				{/* Metadata */}
				<div className="flex flex-wrap items-center gap-3 text-gray-600 text-sm sm:gap-4">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-20" />
				</div>

				{/* URL */}
				<Skeleton className="mt-3 h-4 w-32" />

				{/* Text content */}
				<div className="mt-4 space-y-2 border-gray-200 border-t border-dashed pt-4">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-4/5" />
				</div>
			</div>

			{/* Comments Section Skeleton */}
			<div className="p-3 sm:p-4">
				<Skeleton className="mb-4 h-6 w-32" />

				{/* Comment items */}
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((id) => (
						<div
							className="border-gray-100 border-b pb-3"
							key={`skeleton-comment-${id}`}
						>
							{/* Comment header */}
							<div className="mb-2 flex items-center gap-2 text-gray-600 text-xs">
								<Skeleton className="h-4 w-4 rounded-full" />
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-3 w-12" />
							</div>

							{/* Comment content */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-4/5" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

import { cn } from "~/lib/utils";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"animate-pulse rounded bg-zinc-200 dark:bg-zinc-800",
				className
			)}
			{...props}
		/>
	);
}

function PostSkeleton() {
	return (
		<div className="w-full border-gray-200 border-b p-3 dark:border-gray-700">
			<div className="space-y-2">
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-3 w-12" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
			</div>
		</div>
	);
}

function PostListSkeleton({ count = 10 }: { count?: number }) {
	return (
		<>
			{Array.from({ length: count }, (_, i) => (
				<PostSkeleton key={i.toString()} />
			))}
		</>
	);
}

export { PostListSkeleton, PostSkeleton, Skeleton };

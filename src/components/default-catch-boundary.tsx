import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const router = useRouter();
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId,
	});
	console.error(error);

	return (
		<div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
			<div>Whoops, something went wrong.</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					onClick={() => {
						router.invalidate();
					}}
					variant={"orange"}
				>
					Try Again
				</Button>
				{isRoot ? (
					<Link
						className={
							"rounded-sm bg-orange-600 px-2 py-1 font-extrabold text-white uppercase dark:bg-orange-700"
						}
						to="/"
					>
						Home
					</Link>
				) : (
					<Link
						className={
							"rounded-sm bg-orange-600 px-2 py-1 font-extrabold text-white uppercase dark:bg-orange-700"
						}
						onClick={(e) => {
							e.preventDefault();
							window.history.back();
						}}
						to="/"
					>
						Go Back
					</Link>
				)}
			</div>
		</div>
	);
}

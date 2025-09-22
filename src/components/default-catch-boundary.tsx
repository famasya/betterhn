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
			<div className="max-w-[600px] text-red-500 text-sm">{error.message}</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					onClick={() => {
						router.invalidate();
					}}
					size="sm"
					variant={"orange"}
				>
					Try Again
				</Button>
				{isRoot ? (
					<Link to="/">
						<Button size="sm" variant={"outline"}>
							Home
						</Button>
					</Link>
				) : (
					<Link
						onClick={(e) => {
							e.preventDefault();
							window.history.back();
						}}
						to="/"
					>
						<Button size="sm" variant={"outline"}>
							Go Back
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
}

import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link, rootRouteId, useMatch } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId,
	});

	return (
		<div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
			<div>Whoops, something went wrong.</div>
			<div>
				<pre>{JSON.stringify(error, null, 2)}</pre>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					onClick={() => {
						window.location.reload();
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

import { Link } from "@tanstack/react-router";

export function NotFound({ children }: { children?: React.ReactNode }) {
	return (
		<div className="flex h-dvh flex-col items-center justify-center gap-2">
			<div className="text-gray-600">
				{children || <p>The page you are looking for does not exist.</p>}
			</div>
			<p className="flex flex-wrap items-center gap-2">
				<Link
					className="rounded-sm bg-orange-600 px-2 py-1 font-black text-sm text-white uppercase hover:bg-orange-700"
					to="/"
				>
					Go back to Home
				</Link>
			</p>
		</div>
	);
}

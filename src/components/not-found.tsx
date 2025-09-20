import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function NotFound({ children }: { children?: React.ReactNode }) {
	return (
		<div className="flex h-dvh flex-col items-center justify-center gap-2">
			<div className="text-gray-600 dark:text-gray-200">
				{children || <p>The page you are looking for does not exist.</p>}
			</div>
			<p className="flex flex-wrap items-center gap-2">
				<Link to="/">
					<Button variant="outline">Go back to Home</Button>
				</Link>
			</p>
		</div>
	);
}

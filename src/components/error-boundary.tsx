import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type ErrorBoundaryProps = {
	error: Error;
	retry?: () => void;
	title?: string;
};

export default function ErrorBoundary({
	error,
	retry,
	title = "Something went wrong",
}: ErrorBoundaryProps) {
	const isDevelopment = process.env.NODE_ENV === "development";

	return (
		<div className="flex min-h-[400px] items-center justify-center bg-gray-50">
			<div className="mx-4 max-w-md text-center">
				<div className="mb-4 flex justify-center">
					<HugeiconsIcon
						className="h-12 w-12 text-red-500"
						icon={InformationCircleIcon}
					/>
				</div>

				<h2 className="mb-2 font-semibold text-gray-900 text-xl">{title}</h2>

				<p className="mb-4 text-gray-600">
					We're sorry, but something unexpected happened. Please try again.
				</p>

				{isDevelopment && (
					<details className="mb-4 rounded bg-red-50 p-3 text-left">
						<summary className="cursor-pointer font-medium text-red-800">
							Error Details (Development)
						</summary>
						<pre className="mt-2 overflow-auto text-red-700 text-xs">
							{error.message}
							{error.stack && `\n\n${error.stack}`}
						</pre>
					</details>
				)}

				<div className="flex justify-center gap-3">
					<button
						className="rounded bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
						onClick={() => window.location.reload()}
						type="button"
					>
						Reload Page
					</button>

					{retry && (
						<button
							className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
							onClick={retry}
							type="button"
						>
							Try Again
						</button>
					)}
				</div>

				<div className="mt-4">
					<a
						className="text-gray-500 text-sm underline hover:text-gray-700"
						href="/"
					>
						← Back to Home
					</a>
				</div>
			</div>
		</div>
	);
}

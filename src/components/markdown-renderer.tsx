import Markdown from "markdown-to-jsx";

export default function MarkdownRenderer({ content }: { content: string }) {
	return (
		<Markdown
			options={{
				overrides: {
					a: {
						props: {
							className: "text-orange-600 hover:text-orange-700 underline",
							target: "_blank",
							rel: "noopener noreferrer",
						},
					},
					p: {
						props: {
							className: "mb-3 last:mb-0",
						},
					},
					code: {
						props: {
							className: "bg-zinc-100 px-2 py-1 rounded text-xs font-mono",
						},
					},
					pre: {
						props: {
							className:
								"bg-zinc-100 p-3 rounded text-xs font-mono overflow-x-auto mt-2",
						},
					},
					h1: {
						props: {
							className: "text-lg font-semibold mt-4 mb-2 first:mt-0",
						},
					},
					h2: {
						props: {
							className: "text-base font-semibold mt-3 mb-2 first:mt-0",
						},
					},
					h3: {
						props: {
							className: "text-sm font-semibold mt-3 mb-2 first:mt-0",
						},
					},
					blockquote: {
						props: {
							className:
								"border-gray-300 border-l-4 pl-3 italic text-gray-600 my-3",
						},
					},
					ul: {
						props: {
							className: "list-disc list-inside my-2",
						},
					},
					ol: {
						props: {
							className: "list-decimal list-inside my-2",
						},
					},
				},
			}}
		>
			{content}
		</Markdown>
	);
}

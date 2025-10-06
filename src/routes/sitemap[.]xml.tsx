import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: ({ request }) => {
				const url = new URL(request.url);
				const baseUrl = `${url.protocol}//${url.host}`;

				const categories = ["top", "new", "best", "job", "ask", "show"];

				const staticPages = [
					{
						loc: baseUrl,
						changefreq: "hourly",
						priority: "1.0",
					},
					...categories.map((category) => ({
						loc: `${baseUrl}/${category}`,
						changefreq: "hourly",
						priority: "0.9",
					})),
				];

				const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
	.map(
		(page) => `  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join("\n")}
</urlset>`;

				return new Response(sitemap, {
					headers: {
						"Content-Type": "application/xml",
					},
				});
			},
		},
	},
});

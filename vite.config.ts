import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3001,
	},
	plugins: [
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tanstackStart({
			customViteReactPlugin: true,
			target: "cloudflare-module",
		}),
		viteReact(),
	],
	build: {
		sourcemap: false,
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
			},
		},
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Node modules chunking
					if (id.includes("node_modules")) {
						// Group React-related packages
						if (id.includes("react") && !id.includes("@tanstack")) {
							return "react-vendor";
						}
						// Group TanStack packages
						if (id.includes("@tanstack")) {
							return "tanstack-vendor";
						}
						// Group Radix UI packages
						if (id.includes("@radix-ui")) {
							return "radix-vendor";
						}
						// Group icon packages
						if (id.includes("@hugeicons")) {
							return "icons-vendor";
						}
						// Group utility packages
						if (
							id.includes("clsx") ||
							id.includes("tailwind-merge") ||
							id.includes("class-variance-authority") ||
							id.includes("date-fns") ||
							id.includes("ky") ||
							id.includes("zod")
						) {
							return "utils-vendor";
						}
					}
				},
			},
		},
	},
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"@tanstack/react-query",
			"@tanstack/react-router",
			"@radix-ui/react-dialog",
			"@radix-ui/react-select",
			"@radix-ui/react-tooltip",
		],
	},
});

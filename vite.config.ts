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

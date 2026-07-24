import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from "node:url";
import "./src/WidgetID.global.mjs";

const cReplayMode = process.env.EMO_DEPLOY_MODE === "replay";

export default defineConfig({
	site: "https://www.emocrete.com",
	trailingSlash: "never",
	adapter: vercel({
		functionPerRoute: true
	}),
	devToolbar: {
		enabled: false
	},
	integrations: cReplayMode ? [] : [
		sitemap(),
	],
	build: {
		inlineStylesheets: "always"
	},
	vite: {
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src/site", import.meta.url)),
			},
		},
	},
});
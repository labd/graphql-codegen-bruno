import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		testTimeout: 5000,
		coverage: {
			provider: "v8",
			all: true,
			include: ["src/**/*.ts"],
		},
		passWithNoTests: true,
		server: {
			deps: {
				fallbackCJS: true,
			},
		}
	},
	resolve: {
		alias: {
			"~src": path.join(__dirname, "src"),
		},
	},
});

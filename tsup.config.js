import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs"],
	dts: false,
	sourcemap: false,
	clean: true,
	minify: false,
	target: "es2022",
	outDir: "dist",
});

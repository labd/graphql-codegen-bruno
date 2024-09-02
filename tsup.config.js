import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs"], // Support both CommonJS and ESM
	dts: false, // Generate .d.ts files
	sourcemap: false, // Generate sourcemaps
	clean: true, // Clean output directory before each build
	minify: false, // Minify the output
	target: "es2022", // Target the latest version of ECMAScript
	outDir: "dist", // Output directory
});

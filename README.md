## GraphQL Codegen Bruno Plugin
This plugin generates a directory with
[Bruno](https://github.com/usebruno/bruno) files with all GraphQL queries in
your codebase

# Installation
```sh
pnpm add -d @labdigital/graphql-codegen-bruno
```

# Usage
Create a `codegen.ts` file in the root of your project with the following content:

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema:
		"schema.graphql",
	documents: [
		"src/**/*.{ts,tsx}"
	],
	generates: {
		// Generate Bruno files in the api-collection directory
		"api-collection/generated.json": {
			plugins: ["@labdigital/graphql-codegen-bruno"],
			config: {

				// Clean the output directory before generating the files
				clean: true

				// Set default values for the generated Bruno variables
				defaults: {
					locale: "nl-NL",
					currency: "EUR"
			}
		},
	},
};

export default config;
```

Then run the following command:

```sh
pnpx graphql-codegen --config codegen.ts
```

# Notes
The `api-collection/generated.json` seems to be needed for GraphQL codegen
to work (we need to generate a file, not a directory). If you know a way to
generate a directory instead of a file, please us know


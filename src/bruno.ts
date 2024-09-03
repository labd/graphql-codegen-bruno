import prettier from "prettier";
import type { FileContent } from "./operations";

export const asBruno = async (
	operation: FileContent,
	sequence: number,
	defaults: Record<string, unknown>,
) => {
	const formattedContent = await prettier.format(operation.content, {
		parser: "graphql",
	});

	const vars = mergeDefaults(operation.vars, defaults);

	return `
meta {
  name: ${operation.name}
  type: graphql
  seq: ${sequence}
}

post {
  url: {{graphql-gateway}}/graphql
  body: graphql
  auth: none
}

body:graphql {
  ${formattedContent.split("\n").join("\n  ")}
}

body:graphql:vars {
  ${JSON.stringify(vars, null, 2).split("\n").join("\n  ")}
}
  `;
};

const mergeDefaults = (
	vars: Record<string, unknown>,
	defaults: Record<string, unknown>,
) => {
	const mergedVars: Record<string, unknown> = {};

	for (const key in vars) {
		mergedVars[key] = vars[key];
	}

	for (const key in defaults) {
		if (key in vars) {
			mergedVars[key] = defaults[key];
		}
	}

	return mergedVars;
};

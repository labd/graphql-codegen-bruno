import path from "node:path";
import type { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import fs from "fs-extra";
import type { GraphQLSchema } from "graphql";
import { asBruno } from "./bruno";
import { extractOperations } from "./operations";

export interface BrunoPluginConfig {
	defaults: Record<string, unknown>;
	clean: boolean;
}

export const plugin: PluginFunction<BrunoPluginConfig> = async (
	schema: GraphQLSchema,
	documents: Types.DocumentFile[],
	config,
	info,
): Promise<string> => {
	if (!info?.outputFile) {
		throw new Error("Output directory not provided");
	}
	const outputDir = path.dirname(info?.outputFile);
	if (config.clean) {
		fs.emptyDirSync(outputDir);
	}

	const operations = extractOperations(schema, documents);
	const result: Record<string, Record<string, string>> = {};
	for (const operation of operations) {
		const subpath = operation.kind === "query" ? "queries" : "mutations";
		const fileName = `${operation.name}.bru`;
		const outputPath = path.join(outputDir, subpath, fileName);

		const formattedContent = await asBruno(operation, config.defaults);

		fs.outputFileSync(outputPath, formattedContent);
		result[operation.name] = {
			filename: fileName,
			source: operation.location
				? path.relative(outputDir, operation.location)
				: "(unknown)",
		};
	}
	return JSON.stringify(result, null, 2);
};

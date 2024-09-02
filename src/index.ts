import path from "node:path";
import type { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import fs from "fs-extra";
import type { GraphQLSchema } from "graphql";
import { asBruno } from "./bruno";
import { extractOperations } from "./operations";

export const plugin: PluginFunction = async (
	schema: GraphQLSchema,
	documents: Types.DocumentFile[],
	config,
	info,
): Promise<string> => {
	const outputDir = info?.outputFile;

	if (!outputDir) {
		throw new Error("Output directory not provided");
	}

	const operations = extractOperations(schema, documents);
	let i = 0;
	for (const operation of operations) {
		const fileName = `${operation.name}.bru`;
		const outputPath = path.join(outputDir, fileName);

		const formattedContent = await asBruno(operation, i);

		fs.outputFileSync(outputPath, formattedContent);
		i++;
	}

	return "";
};

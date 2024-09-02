import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLSchema } from "graphql";
import fs from "fs-extra";
import path from "path";
import prettier from "prettier";
import { extractOperations } from "./operations";
import { asBruno } from "./bruno";

export interface BruPluginConfig {
  outputDir?: string;
}

export const plugin: PluginFunction<BruPluginConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: BruPluginConfig
): Promise<string> => {
  const outputDir = config.outputDir || "bruno-queries";

  const operations = extractOperations(documents);
  let i = 0;
  for (const operation of operations) {
    const fileName = `${operation.name}.bru`;
    const outputPath = path.join(outputDir, fileName);

    const formattedContent = await asBruno(operation, i);

    fs.outputFileSync(outputPath, formattedContent);
    console.log(`Generated .bru file: ${outputPath}`);
    i++;
  }

  return "";
};

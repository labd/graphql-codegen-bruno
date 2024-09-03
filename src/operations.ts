import assert from "node:assert";
import type { Types } from "@graphql-codegen/plugin-helpers";
import {
	type FragmentDefinitionNode,
	type GraphQLSchema,
	Kind,
	type OperationDefinitionNode,
} from "graphql";
import { generateExampleVariables } from "./vars";

export interface BruPluginConfig {
	outputDir?: string;
}

export type FileContent = {
	name: string;
	content: string;
	vars: Record<string, unknown>;
	location: string | undefined;
};

export const extractOperations = (
	schema: GraphQLSchema,
	documents: Types.DocumentFile[],
): FileContent[] => {
	const results: FileContent[] = [];

	// Step 1: Collect all fragments
	const allFragments: Record<string, FragmentDefinitionNode> = {};

	for (const doc of documents) {
		if (doc.document) {
			for (const definition of doc.document.definitions) {
				if (definition.kind === Kind.FRAGMENT_DEFINITION) {
					const fragmentName = definition.name.value;
					allFragments[fragmentName] = definition as FragmentDefinitionNode;
				}
			}
		}
	}

	// Step 2: Process operations and append only used fragments
	for (const doc of documents) {
		if (doc.document) {
			const operations = doc.document.definitions
				.filter((def) => def.kind === Kind.OPERATION_DEFINITION)
				.filter((operation) => operation.name?.value !== undefined) // Filter out unnamed operations
				.map((operation): FileContent => {
					assert(operation.name?.value);

					const operationString = doc.rawSDL || "";

					// Collect the names of all fragments used in this operation
					const usedFragments = new Set<string>();
					const collectFragments = (
						node: OperationDefinitionNode | FragmentDefinitionNode,
					) => {
						if (node.selectionSet) {
							for (const selection of node.selectionSet.selections) {
								if (selection.kind === Kind.FRAGMENT_SPREAD) {
									usedFragments.add(selection.name.value);
									// Recursively collect fragments within fragments
									if (allFragments[selection.name.value]) {
										collectFragments(allFragments[selection.name.value]);
									}
								} else if (selection.selectionSet) {
									// @ts-expect-error
									collectFragments(selection as OperationDefinitionNode);
								}
							}
						}
					};

					collectFragments(operation);

					// Append only the used fragments
					let fileContent = operationString;

					for (const fragmentName of usedFragments) {
						const fragment = allFragments[fragmentName];
						if (fragment) {
							const fragmentString = fragment.loc?.source.body || "";
							fileContent += `\n${fragmentString}`;
						}
					}

					return {
						name: operation.name?.value,
						location: operation.loc?.source.name,
						content: fileContent,
						vars: generateExampleVariables(
							schema,
							operation as OperationDefinitionNode,
						),
					};
				});

			results.push(...operations);
		}
	}

	return results;
};

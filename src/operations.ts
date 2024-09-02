import { Types } from "@graphql-codegen/plugin-helpers";
import { Kind, FragmentDefinitionNode, OperationDefinitionNode } from "graphql";

export interface BruPluginConfig {
  outputDir?: string;
}

export type FileContent = {
  name: string;
  content: string;
};

export const extractOperations = (
  documents: Types.DocumentFile[]
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
        .map((operation) => {
          let operationString = doc.rawSDL || "";

          // Collect the names of all fragments used in this operation
          const usedFragments = new Set<string>();
          const collectFragments = (
            node: OperationDefinitionNode | FragmentDefinitionNode
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
                  collectFragments(selection as OperationDefinitionNode);
                }
              }
            }
          };

          collectFragments(operation as OperationDefinitionNode);

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
            name:
              (operation as any).name?.value ||
              `Unnamed_${Math.random().toString(36).substring(7)}`,
            content: fileContent,
          } satisfies FileContent;
        });

      results.push(...operations);
    }
  }

  return results;
};

import path from "node:path";
import { afterEach } from "node:test";
import type { Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadDocumentsSync, loadSchemaSync } from "@graphql-tools/load";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { type BrunoPluginConfig, plugin } from "./index";

const mockOutputDir = path.join(__dirname, "__output__");
const snapshotDir = path.join(__dirname, "__snapshots__");
const mockSchemaPath = path.join(__dirname, "__mocks__", "schema.graphqls");
const mockDocumentsPath = path.join(__dirname, "__mocks__", "query.graphql");

afterEach(() => {
	fs.removeSync(mockOutputDir);
});

describe("Bruno Plugin", () => {
	it("should generate the expected output", async () => {
		// Load the mock schema
		const schema = loadSchemaSync(mockSchemaPath, {
			loaders: [new GraphQLFileLoader()],
		});

		// Load the mock documents
		const documents = loadDocumentsSync(mockDocumentsPath, {
			loaders: [new GraphQLFileLoader()],
		}) as Types.DocumentFile[];

		// Clear the output directory before running the test
		fs.ensureDirSync(mockOutputDir);

		// Run the plugin
		const outputFile = path.join(mockOutputDir, "output.json");
		const pluginConfig: BrunoPluginConfig = {
			defaults: {},
			clean: false,
		};
		const data = await plugin(schema, documents, pluginConfig, { outputFile });

		expect(data).toBeDefined();

		const result = fs.readFileSync(
			path.join(mockOutputDir, "queries", "GetCustomer.bru"),
			"utf-8",
		);
		await expect(result).toMatchFileSnapshot(
			path.join(snapshotDir, "queries", "GetCustomer.bru"),
		);
	});
});

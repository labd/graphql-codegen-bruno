import {
	GraphQLInputObjectType,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLScalarType,
	type GraphQLSchema,
	type GraphQLType,
	Kind,
	type NamedTypeNode,
	type OperationDefinitionNode,
} from "graphql";

const generateExampleValue = (
	schema: GraphQLSchema,
	type: GraphQLType,
): any => {
	if (type instanceof GraphQLNonNull) {
		return generateExampleValue(schema, type.ofType);
	} else if (type instanceof GraphQLList) {
		return [generateExampleValue(schema, type.ofType)];
	} else if (type instanceof GraphQLScalarType) {
		switch (type.name) {
			case "Int":
				return 123;
			case "Float":
				return 123.45;
			case "String":
				return "example";
			case "Boolean":
				return true;
			case "ID":
				return "example-id";
			default:
				return "example";
		}
	} else if (type instanceof GraphQLInputObjectType) {
		const fields = type.getFields();
		const exampleObject: Record<string, any> = {};

		for (const key in fields) {
			exampleObject[key] = generateExampleValue(schema, fields[key].type);
		}

		return exampleObject;
	} else if (type instanceof GraphQLObjectType) {
		// Similar logic as above for handling output types, if needed.
		return {};
	} else {
		return "";
	}
};

export const generateExampleVariables = (
	schema: GraphQLSchema,
	operation: OperationDefinitionNode,
): Record<string, any> => {
	const exampleVariables: Record<string, any> = {};

	for (const variable of operation.variableDefinitions || []) {
		if (variable.kind === Kind.VARIABLE_DEFINITION) {
			let variableType: GraphQLType | undefined;

			// Narrow the type to NamedTypeNode
			if (variable.type.kind === Kind.NAMED_TYPE) {
				variableType = schema.getType(
					(variable.type as NamedTypeNode).name.value,
				);
			} else if (variable.type.kind === Kind.NON_NULL_TYPE) {
				const nonNullType = variable.type.type;
				if (nonNullType.kind === Kind.NAMED_TYPE) {
					variableType = schema.getType(
						(nonNullType as NamedTypeNode).name.value,
					);
				}
			} else if (variable.type.kind === Kind.LIST_TYPE) {
				const listType = variable.type.type;
				if (listType.kind === Kind.NAMED_TYPE) {
					variableType = schema.getType((listType as NamedTypeNode).name.value);
				}
			}

			if (variableType) {
				exampleVariables[variable.variable.name.value] = generateExampleValue(
					schema,
					variableType,
				);
			}
		}
	}

	return exampleVariables;
};

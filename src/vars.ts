import {
	GraphQLEnumType,
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
	type TypeNode,
	isEnumType,
	isInputObjectType,
	isListType,
	isNonNullType,
	isObjectType,
	isScalarType,
} from "graphql";

export const generateExampleVariables = (
	schema: GraphQLSchema,
	operation: OperationDefinitionNode,
): Record<string, unknown> => {
	const exampleVariables: Record<string, unknown> = {};

	for (const variable of operation.variableDefinitions || []) {
		if (variable.kind === Kind.VARIABLE_DEFINITION) {
			let variableType: GraphQLType | undefined;
			exampleVariables[variable.variable.name.value] = getExampleValue(
				schema,
				variable.type,
			);
		}
	}

	return exampleVariables;
};

const getExampleValue = (schema: GraphQLSchema, type: TypeNode): unknown => {
	if (type.kind === Kind.NAMED_TYPE) {
		const variableType = schema.getType((type as NamedTypeNode).name.value);

		if (variableType) {
			return generateExampleValue(variableType);
		} else {
			return null;
		}
	} else if (type.kind === Kind.NON_NULL_TYPE) {
		return getExampleValue(schema, type.type);
	} else if (type.kind === Kind.LIST_TYPE) {
		return [getExampleValue(schema, type.type)];
	}
};

/**
 * Generate an example value for a given GraphQL type. This can be either
 * a scalar type, an input object type, or a list of either.
 */
const generateExampleValue = (type: GraphQLType): unknown => {
	if (type instanceof GraphQLNonNull || isNonNullType(type)) {
		return generateExampleValue(type.ofType);
	} else if (type instanceof GraphQLList || isListType(type)) {
		return [generateExampleValue(type.ofType)];
	} else if (type instanceof GraphQLScalarType || isScalarType(type)) {
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
	} else if (
		type instanceof GraphQLInputObjectType ||
		isInputObjectType(type)
	) {
		const fields = type.getFields();
		const exampleObject: Record<string, unknown> = {};

		for (const key in fields) {
			exampleObject[key] = generateExampleValue(fields[key].type);
		}

		return exampleObject;
	} else if (type instanceof GraphQLObjectType || isObjectType(type)) {
		// Similar logic as above for handling output types, if needed.
		return {};
	} else if (type instanceof GraphQLEnumType || isEnumType(type)) {
		return type.getValues()[0].value;
	} else {
		console.warn("Unknown type", type, type instanceof GraphQLInputObjectType);
		return "";
	}
};

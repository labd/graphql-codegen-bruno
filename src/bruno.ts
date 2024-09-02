import { FileContent } from "./operations";
import prettier from "prettier";
import fs from "fs-extra";

export const asBruno = async (operation: FileContent, sequence: number) => {

    const formattedContent = await prettier.format(operation.content, {
      parser: "graphql",
    });


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
}
  `
}


import { defineDocumentType, makeSource } from "contentlayer2/source-files";

export const Documentation = defineDocumentType(() => ({
  name: "Documentation",
  filePathPattern: "**/*.md",
  fields: {
    title: {
      type: "string",
      required: true,
    },
  },
}));

export default makeSource({ contentDirPath: "docs", documentTypes: [Documentation] });

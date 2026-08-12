import type { EditorDefinition } from "@manifest-editor/shell";
import { PartOfReferenceEditor } from "./PartOfReferenceEditor";

export const partOfReferenceEditor: EditorDefinition = {
  id: "@manifest-editor/part-of-reference",
  label: "Part of",
  supports: {
    edit: true,
    properties: ["label", "summary", "id"],
    resourceTypes: ["Collection", "Manifest", "ContentResource"],
    custom: (resource) => resource.property === "partOf",
  },
  component: () => <PartOfReferenceEditor />,
};

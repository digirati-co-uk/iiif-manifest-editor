import type { MessageReference } from "@manifest-editor/i18n";
import type { EditorDefinition } from "@manifest-editor/shell";
import { PartOfReferenceEditor } from "./PartOfReferenceEditor";

export const partOfReferenceEditor: EditorDefinition & {
  labelMessage?: MessageReference;
  summaryMessage?: MessageReference;
} = {
  id: "@manifest-editor/part-of-reference",
  label: "Part of",
  labelMessage: { namespace: "editors", key: "ui.partOf" },
  supports: {
    edit: true,
    properties: ["label", "summary", "id"],
    resourceTypes: ["Collection", "Manifest", "ContentResource"],
    custom: (resource) => resource.property === "partOf",
  },
  component: () => <PartOfReferenceEditor />,
};

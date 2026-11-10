import type { MessageReference } from "@manifest-editor/i18n";
import { EditorDefinition } from "@manifest-editor/shell";
import { Metadata } from "./Metadata";

export const metadata: EditorDefinition & { labelMessage?: MessageReference; summaryMessage?: MessageReference } = {
  id: "@manifest-editor/metadata",
  label: "Metadata",
  labelMessage: { namespace: "editors", key: "fields.metadata" },
  supports: {
    edit: true,
    properties: ["metadata"],
    resourceTypes: [
      "Collection",
      "Manifest",
      "Canvas",
      "Range",
      "ContentResource",
      "Annotation",
      "AnnotationCollection",
    ],
  },
  component: () => <Metadata />,
};

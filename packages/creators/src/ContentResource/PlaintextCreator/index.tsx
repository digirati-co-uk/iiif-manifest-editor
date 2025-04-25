import { defineCreator } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { CreatePlaintextForm, createPlaintext } from "./create-plaintext";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/plaintext-creator": typeof plaintextCreator;
    }
  }
}

export const plaintextCreator = defineCreator({
  id: "@manifest-editor/plaintext-creator",
  create: createPlaintext,
  label: "Plaintext",
  summary: "Add link to an plaintext",
  icon: <TextFormatIcon />,
  render(ctx) {
    return <CreatePlaintextForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["label", "format"],
  supports: {
    parentFields: ["seeAlso", "rendering", "homepage"],
  },
  staticFields: {
    format: "text/plain",
  },
});

import { getContentType, isHttpUrl, matchesExtension } from "../../resource-probes";
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
  label: "Plain text link",
  summary: "Link to an external plain-text file.",
  icon: <TextFormatIcon />,
  async supportsResource(value, helpers) {
    if (!isHttpUrl(value)) return false;
    const contentType = await getContentType(value, helpers);
    return contentType.startsWith("text/plain") || matchesExtension(value, [".txt"])
      ? { initialData: { url: value } }
      : false;
  },
  render(ctx) {
    return <CreatePlaintextForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["label", "format"],
  supports: {
    initialData: true,
    parentFields: ["seeAlso", "rendering"],
  },
  staticFields: {
    format: "text/plain",
  },
});

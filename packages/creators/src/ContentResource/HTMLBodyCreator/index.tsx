import { defineCreator } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { CreateHTMLBodyForm, createHtmlBody } from "./create-html-body";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/html-body-creator": typeof htmlBodyCreator;
    }
  }
}

export const htmlBodyCreator = defineCreator({
  id: "@manifest-editor/html-body-creator",
  create: createHtmlBody,
  label: "HTML Body",
  summary: "Add HTML annotation body",
  icon: <TextFormatIcon />,
  render(ctx) {
    return <CreateHTMLBodyForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "language", "type", "format", "value"],
  supports: {
    parentTypes: ["Annotation"],
    parentFields: ["body"],
  },
  staticFields: {
    type: "TextualBody",
    format: "text/html",
  },
});

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
    parentTypes: ["Annotation", "ContentResource"],
    parentFields: ["body", "items"],
    custom(parent, vault) {
      if (parent.resource.type === "Annotation") {
        return parent.property === "body";
      }

      const resource = vault.get(
        parent.resource as any,
        { skipSelfReturn: false } as any,
      ) as any;
      return parent.property === "items" && resource?.type === "Choice";
    },
  },
  staticFields: {
    type: "TextualBody",
    format: "text/html",
  },
});

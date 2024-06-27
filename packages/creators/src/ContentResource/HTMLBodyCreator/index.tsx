import { CreateHTMLBodyForm, createHtmlBody } from "./create-html-body";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { CreatorDefinition } from "@manifest-editor/creator-api";

export const htmlBodyCreator: CreatorDefinition = {
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
};

import { CreateHTMLAnnotation, createHtmlAnnotation } from "./create-html-annotation";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { CreatorDefinition } from "@manifest-editor/creator-api";

export const htmlAnnotation: CreatorDefinition = {
  id: "@manifest-editor/html-annotation",
  create: createHtmlAnnotation,
  label: "HTML Annotation",
  summary: "Add HTML annotation",
  icon: <TextFormatIcon />,
  render(ctx) {
    return <CreateHTMLAnnotation {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  additionalTypes: ["Canvas"],
  supports: {
    initialData: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Annotation",
  },
};

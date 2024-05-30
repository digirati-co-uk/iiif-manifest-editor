import { CreateHTMLAnnotation, createHtmlAnnotation } from "./create-html-annotation";
import { CreatorDefinition } from "@manifest-editor/creator-api";
import { HTMLIcon } from "@manifest-editor/components";

export const htmlAnnotation: CreatorDefinition = {
  id: "@manifest-editor/html-annotation",
  create: createHtmlAnnotation,
  label: "HTML",
  summary: "HTML annotation",
  icon: <HTMLIcon />,
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

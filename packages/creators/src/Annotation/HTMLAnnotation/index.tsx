import { HTMLIcon } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";
import {
  CreateHTMLAnnotation,
  type CreateHTMLAnnotationPayload,
  createHtmlAnnotation,
} from "./create-html-annotation";

export const htmlAnnotation: CreatorDefinition<CreateHTMLAnnotationPayload> = {
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

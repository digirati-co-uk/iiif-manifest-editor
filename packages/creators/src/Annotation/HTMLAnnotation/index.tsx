import { HTMLIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { CreateHTMLAnnotation, createHtmlAnnotation } from "./create-html-annotation";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/html-annotation": typeof htmlAnnotation;
    }
  }
}

export const htmlAnnotation = defineCreator({
  id: "@manifest-editor/html-annotation",
  create: createHtmlAnnotation,
  label: "HTML",
  labelMessage: { namespace: "creators", key: "definitions.html.label" },
  summary: "Write formatted text to display on a canvas.",
  summaryMessage: { namespace: "creators", key: "definitions.html.summary" },
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
});

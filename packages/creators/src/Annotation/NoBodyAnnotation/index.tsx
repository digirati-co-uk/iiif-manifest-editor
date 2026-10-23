import type { InternationalString } from "@iiif/presentation-3";
import { EmptyCanvasIcon } from "@manifest-editor/components";
import {
  type CreatorFunctionContext,
  defineCreator,
} from "@manifest-editor/creator-api";

// @todo combine this with the content resource one.

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/no-body-annotation": typeof noBodyAnnotation;
    }
  }
}

export interface NoBodyAnnotationPayload {
  label?: InternationalString;
  motivation?: string;
}

export const noBodyAnnotation = defineCreator({
  id: "@manifest-editor/no-body-annotation",
  create: createNoBodyAnnotation,
  label: "Highlight",
  summary: "Mark a region of the canvas without adding any content.",
  icon: <EmptyCanvasIcon />,
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "target"],
  supports: {
    initialData: true,
    parentTypes: ["AnnotationPage"],
    parentFields: ["items"],
    disallowPainting: true,
  },
  actionButton: "Create highlight",
  sideEffects: [],
  staticFields: {
    type: "Annotation",
  },
});

export function createNoBodyAnnotation(
  data: NoBodyAnnotationPayload,
  ctx: CreatorFunctionContext,
) {
  return ctx.embed({
    id: ctx.generateId("annotation"),
    type: "Annotation",
    label: data?.label,
    motivation:
      data.motivation || ctx.options.initialData?.motivation || "highlighting",
    target: ctx.getTarget(),
  });
}

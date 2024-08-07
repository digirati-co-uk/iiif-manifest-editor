import { InternationalString } from "@iiif/presentation-3";
import { CreatorDefinition, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { EmptyCanvasIcon } from "@manifest-editor/components";

// @todo combine this with the content resource one.

interface NoBodyAnnotationPayload {
  label?: InternationalString;
  motivation?: string;
}

export const noBodyAnnotation: CreatorDefinition = {
  id: "@manifest-editor/no-body-annotation",
  create: createNoBodyAnnotation,
  label: "Annotation without body",
  summary: "Add an annotation that only has motivation and target",
  icon: <EmptyCanvasIcon />,
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "target"],
  supports: {
    initialData: true,
    parentTypes: ["AnnotationPage"],
    parentFields: ["items"],
    disallowPainting: true,
  },
  sideEffects: [],
  staticFields: {
    type: "Annotation",
  },
};

export function createNoBodyAnnotation(data: NoBodyAnnotationPayload, ctx: CreatorFunctionContext) {
  return ctx.embed({
    id: ctx.generateId("annotation"),
    type: "Annotation",
    label: data?.label,
    motivation: data.motivation || ctx.options.initialData?.motivation || "highlighting",
    target: ctx.getTarget(),
  });
}

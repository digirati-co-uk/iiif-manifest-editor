import { AddImageIcon, HTMLIcon } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";
import { CreateCaptionedImageAnnotation, createCaptionedImageAnnotation } from "./create-captioned-image-annotation";

export const captionedImageAnnotation: CreatorDefinition = {
  id: "@manifest-editor/captioned-image-annotation",
  create: createCaptionedImageAnnotation,
  label: "Captioned image",
  summary: "Add an image from a URL with caption",
  icon: <AddImageIcon />,
  render(ctx) {
    return <CreateCaptionedImageAnnotation {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  additionalTypes: ["Canvas"],
  supports: {
    initialData: true,
    parentTypes: ["AnnotationPage"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Annotation",
  },
};

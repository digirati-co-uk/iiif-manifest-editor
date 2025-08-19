import { AddImageIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import {
  CreateCaptionedImageAnnotation,
  createCaptionedImageAnnotation,
} from "./create-captioned-image-annotation";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/captioned-image-annotation": typeof captionedImageAnnotation;
    }
  }
}

export const captionedImageAnnotation = defineCreator({
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
    disallowPainting: true,
    parentTypes: ["AnnotationPage"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Annotation",
  },
});

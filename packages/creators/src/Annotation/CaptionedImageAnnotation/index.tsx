import { AddImageIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { imageUrlCreator } from "../../ContentResource/ImageUrlCreator";
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
  summary: "Add an image from a direct link and write its caption.",
  icon: <AddImageIcon />,
  async supportsResource(value, helpers, ctx) {
    const result = await imageUrlCreator.supportsResource!(value, helpers, ctx);
    return result ? { initialData: { imageUrl: value } } : false;
  },
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

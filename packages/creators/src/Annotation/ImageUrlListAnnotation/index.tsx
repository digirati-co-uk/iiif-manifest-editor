import { ImageListIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { CreateImageUrlListForm } from "../../ContentResource/ImageUrlListCreator/create-image-url-list";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import { createImageUrlListAnnotation } from "./create-image-url-list-annotation";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/image-url-list-annotation": typeof imageUrlListAnnotation;
    }
  }
}

export const imageUrlListAnnotation = defineCreator({
  id: "@manifest-editor/image-url-list-annotation",
  create: createImageUrlListAnnotation,
  label: "List of Images",
  dependencies: ["@manifest-editor/image-url-annotation"],
  summary: "List of Images from URLs",
  tags: ["image"],
  icon: <ImageListIcon />,
  render(ctx) {
    return <CreateImageUrlListForm {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  additionalTypes: ["Canvas"],
  supports: {
    onlyPainting: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  sideEffects: [
    resizeToFitService,
    resizeResourceToEmptyCanvas,
    repositionMultipleImages,
  ],
  staticFields: {
    type: "Annotation",
  },
});

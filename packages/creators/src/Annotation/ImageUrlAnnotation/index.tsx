import { AddImageIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import { CreateImageUrlAnnotationForm, createImageUrlAnnotation } from "./create-image-url-annotation";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/image-url-annotation": typeof imageUrlAnnotation;
    }
  }
}

export const imageUrlAnnotation = defineCreator({
  id: "@manifest-editor/image-url-annotation",
  create: createImageUrlAnnotation,
  label: "Image",
  dependencies: ["@manifest-editor/image-url-creator"],
  summary: "Image from URL",
  tags: ["image"],
  icon: <AddImageIcon />,
  render(ctx) {
    return <CreateImageUrlAnnotationForm {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  additionalTypes: ["Canvas"],
  supports: {
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  sideEffects: [resizeToFitService, resizeResourceToEmptyCanvas, repositionMultipleImages],
  staticFields: {
    type: "Annotation",
  },
});

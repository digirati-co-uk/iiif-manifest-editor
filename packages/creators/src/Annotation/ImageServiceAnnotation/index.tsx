import { IIIFLogo } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import { CreateImageServiceAnnotationForm, createImageServiceAnnotation } from "./create-service-annotation";
import { imageServiceCreator } from "../../ContentResource/ImageServiceCreator";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/image-service-annotation": typeof imageServiceAnnotation;
    }
  }
}

// @todo combine this with the content resource one.
export const imageServiceAnnotation = defineCreator({
  id: "@manifest-editor/image-service-annotation",
  create: createImageServiceAnnotation,
  label: "IIIF image",
  labelMessage: { namespace: "creators", key: "definitions.service.label" },
  dependencies: ["@manifest-editor/image-service-creator"],
  summary: "Add a zoomable image using an IIIF image service or info.json link.",
  summaryMessage: { namespace: "creators", key: "definitions.service.summary" },
  tags: ["image", "image-service"],
  icon: <IIIFLogo />,
  render(ctx) {
    return <CreateImageServiceAnnotationForm {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  additionalTypes: ["Canvas"],
  supportsResource: imageServiceCreator.supportsResource,
  supports: {
    initialData: true,
    onlyPainting: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  sideEffects: [resizeToFitService, resizeResourceToEmptyCanvas, repositionMultipleImages],
  staticFields: {
    type: "Annotation",
  },
});

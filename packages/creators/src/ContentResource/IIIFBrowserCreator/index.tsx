import { creatorValidationError } from "../../validation-messages";
import { IIIFBrowserIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { getIIIFType, getJsonResource, isDigitalCollectionPage } from "../../resource-probes";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import { updateCanvasThumbnailFromCrop } from "../../side-effects/update-canvas-thumbnail-from-crop";
import { IIIFBrowserCreatorForm, createFromIIIFBrowserOutput } from "./iiif-browser-creator";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/iiif-browser-creator": typeof iiifBrowserCreator;
    }
  }
}

export const iiifBrowserCreator = defineCreator({
  validationErrorMessage: creatorValidationError,
  id: "@manifest-editor/iiif-browser-creator",
  create: createFromIIIFBrowserOutput,
  label: "Browse IIIF content",
  labelMessage: { namespace: "creators", key: "definitions.browser.label" },
  hideSummary: true,
  summary: "Browse an IIIF manifest, collection, or supported collection webpage and choose content to add.",
  summaryMessage: { namespace: "creators", key: "definitions.browser.summary" },
  icon: <IIIFBrowserIcon />,
  configuration: {
    fields: [
      {
        id: "addManifestMetadataToCanvas",
        type: "checkbox",
        label: "Add manifest metadata to imported canvases",
        labelMessage: { namespace: "creators", key: "definitions.browser.copyMetadata" },
        summary: "Copies metadata from the source Manifest when the IIIF Browser creates a Canvas.",
        summaryMessage: { namespace: "creators", key: "definitions.browser.copyMetadataHelp" },
        defaultValue: true,
      },
    ],
  },
  render(ctx: any) {
    return <IIIFBrowserCreatorForm {...ctx} />;
  },
  hiddenModal: true,
  tags: ["image", "image-service"],
  async supportsResource(value, helpers) {
    const resource = await getJsonResource(value, helpers);
    const type = getIIIFType(resource);
    if (type === "Manifest" || type === "Collection") {
      return { initialData: { url: value } };
    }
    if (await isDigitalCollectionPage(value)) {
      return { initialData: { url: value } };
    }
    return false;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "language", "type", "format", "value"],
  additionalTypes: ["Annotation", "Canvas"],
  supports: {
    initialData: true,
    onlyPainting: true,
    parentTypes: ["Annotation", "Manifest", "AnnotationPage"],
    parentFields: ["body", "items"],
    parentFieldMap: {
      Annotation: ["body"],
      Manifest: ["items"],
      AnnotationPage: ["items"],
    },
  },
  sideEffects: [
    updateCanvasThumbnailFromCrop,
    resizeToFitService,
    resizeResourceToEmptyCanvas,
    repositionMultipleImages,
  ],
  staticFields: {},
});

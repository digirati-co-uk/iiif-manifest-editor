import { IIIFBrowserIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { repositionMultipleImages } from "../../side-effects/reposition-multiple-images";
import { resizeResourceToEmptyCanvas } from "../../side-effects/resize-resource-to-empty-canvas";
import { resizeToFitService } from "../../side-effects/resize-to-fit-service";
import {
  IIIFBrowserCreatorForm,
  createFromIIIFBrowserOutput,
} from "./iiif-browser-creator";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/iiif-browser-creator": typeof iiifBrowserCreator;
    }
  }
}

export const iiifBrowserCreator = defineCreator({
  id: "@manifest-editor/iiif-browser-creator",
  create: createFromIIIFBrowserOutput,
  label: "IIIF Browser",
  summary: "Browse IIIF Resources",
  icon: <IIIFBrowserIcon />,
  render(ctx: any) {
    return <IIIFBrowserCreatorForm {...ctx} />;
  },
  hiddenModal: true,
  tags: ["image", "image-service"],
  resourceType: "ContentResource",
  resourceFields: ["id", "language", "type", "format", "value"],
  additionalTypes: ["Annotation", "Canvas"],
  supports: {
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
    resizeToFitService,
    resizeResourceToEmptyCanvas,
    repositionMultipleImages,
  ],
  staticFields: {},
});

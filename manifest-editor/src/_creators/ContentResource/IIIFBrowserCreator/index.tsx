import { CreatorDefinition } from "@/creator-api";
import textFormatIcon from "@/icons/TextFormatIcon.svg";
import React from "react";
import {
  createFromIIIFBrowserOutput,
  IIIFBrowserCreatorForm,
} from "@/_creators/ContentResource/IIIFBrowserCreator/iiif-browser-creator";
import { resizeResourceToEmptyCanvas } from "@/_creators/side-effects/resize-resource-to-empty-canvas";
import { repositionMultipleImages } from "@/_creators/side-effects/reposition-multiple-images";
import { resizeToFitService } from "@/_creators/side-effects/resize-to-fit-service";

export const iiifBrowserCreator: CreatorDefinition = {
  id: "@manifest-editor/iiif-browser-creator",
  create: createFromIIIFBrowserOutput,
  label: "IIIF Browser",
  summary: "Find a resource within a IIIF Collection or Manifest",
  icon: <img src={textFormatIcon} alt="" />,
  render(ctx: any) {
    return <IIIFBrowserCreatorForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "language", "type", "format", "value"],
  additionalTypes: ["Annotation", "Canvas"],
  supports: {
    parentTypes: ["Annotation", "Manifest", "AnnotationPage"],
    parentFieldMap: {
      Annotation: ["body"],
      Manifest: ["items"],
      AnnotationPage: ["items"],
    },
  },
  sideEffects: [resizeToFitService, resizeResourceToEmptyCanvas, repositionMultipleImages],
  staticFields: {},
};

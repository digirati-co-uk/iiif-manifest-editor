import { CreatorDefinition } from "@/creator-api";
import textFormatIcon from "@/icons/TextFormatIcon.svg";
import React from "react";
import {
  createFromIIIFBrowserOutput,
  IIIFBrowserCreatorForm,
} from "@/_creators/ContentResource/IIIFBrowserCreator/iiif-browser-creator";
import { resizeResourceToEmptyCanvas } from "@/_creators/side-effects/resize-resource-to-empty-canvas";

export const iiifBrowserCreator: CreatorDefinition = {
  id: "@manifest-editor/iiif-browser-creator",
  create: createFromIIIFBrowserOutput,
  label: "IIIF Browser",
  summary: "Find a resource within a IIIF Collection or Manifest",
  icon: <img src={textFormatIcon} alt="" />,
  render(ctx) {
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
  sideEffects: [resizeResourceToEmptyCanvas],
  staticFields: {},
};

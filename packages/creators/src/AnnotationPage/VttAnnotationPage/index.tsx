import { creatorValidationError } from "../../validation-messages";
import { defineCreator } from "@manifest-editor/creator-api";
import { canvasHasAv } from "@manifest-editor/editor-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { CreateVttAnnotationPageForm, createVttAnnotationPage } from "./create-vtt-annotation-page";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/vtt-annotation-page": typeof vttAnnotationPage;
    }
  }
}

export const vttAnnotationPage = defineCreator({
  validationErrorMessage: creatorValidationError,
  id: "@manifest-editor/vtt-annotation-page",
  label: "WebVTT captions",
  labelMessage: { namespace: "creators", key: "definitions.vtt.label" },
  tags: ["captions"],
  summary: "Add subtitles or captions from a WebVTT file to an audio or video canvas.",
  summaryMessage: { namespace: "creators", key: "definitions.vtt.summary" },
  icon: <TextFormatIcon />,
  create: createVttAnnotationPage,
  render: (ctx) => <CreateVttAnnotationPageForm {...ctx} />,
  resourceType: "AnnotationPage",
  resourceFields: ["id", "type", "items"],
  supports: {
    parentTypes: ["Canvas"],
    parentFields: ["annotations"],
    custom: ({ resource }, vault) => canvasHasAv(vault, resource),
  },
});

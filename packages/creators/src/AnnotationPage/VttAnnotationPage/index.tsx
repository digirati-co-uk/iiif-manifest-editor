import { defineCreator } from "@manifest-editor/creator-api";
import type { Reference } from "@iiif/presentation-3";
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
  id: "@manifest-editor/vtt-annotation-page",
  label: "WebVTT captions",
  summary: "Link captions to an audio or video canvas",
  icon: <TextFormatIcon />,
  create: createVttAnnotationPage,
  render: (ctx) => <CreateVttAnnotationPageForm {...ctx} />,
  resourceType: "AnnotationPage",
  resourceFields: ["id", "type", "items"],
  supports: {
    parentTypes: ["Canvas"],
    parentFields: ["annotations"],
    custom: ({ resource }, vault) => {
      const canvas = vault.get(resource);
      const hasMedia = (ref: any): boolean => {
        if (ref?.type === "SpecificResource") return hasMedia(ref.source);
        const body = vault.get(ref);
        if (body?.type === "SpecificResource") return hasMedia(body.source);
        if (body?.type === "Choice") return (body.items || []).some(hasMedia);
        return body?.type === "Sound" || body?.type === "Video";
      };
      return (canvas?.items || []).some((pageRef: Reference) =>
        (vault.get(pageRef)?.items || []).some((annotationRef: Reference) => {
          const annotation = vault.get(annotationRef);
          const motivation = [annotation?.motivation].flat();
          return motivation.includes("painting") && [annotation?.body].flat().filter(Boolean).some(hasMedia);
        })
      );
    },
  },
});

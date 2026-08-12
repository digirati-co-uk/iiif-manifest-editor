import type { InternationalString } from "@iiif/parser";
import { defineCreator } from "@manifest-editor/creator-api";
import { ThumbnailStripIcon } from "@manifest-editor/ui/icons/ThumbnailStripIcon";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/empty-annotation-page": typeof emptyAnnotationPage;
    }
  }
}

export const emptyAnnotationPage = defineCreator({
  id: "@manifest-editor/empty-annotation-page",
  create: (
    data: {
      label?: InternationalString;
    },
    ctx,
  ) => {
    return ctx.embed({
      id: ctx.generateId("annotations"),
      label: data.label,
      type: "AnnotationPage",
      items: [],
    });
  },
  label: "Empty annotation page",
  summary: "AnnotationPage with nothing",
  icon: <ThumbnailStripIcon />,
  resourceType: "AnnotationPage",
  resourceFields: ["id", "type", "items"],
  supports: {
    parentTypes: ["Manifest", "Canvas", "Range", "Scene"] as any,
    parentFieldMap: {
      Manifest: ["annotations"],
      Canvas: ["items", "annotations"],
      Range: ["annotations"],
      Scene: ["annotations"],
    } as any,
  },
});

import { CreatorDefinition, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { ThumbnailStripIcon } from "@manifest-editor/ui/icons/ThumbnailStripIcon";

export const emptyAnnotationPage: CreatorDefinition = {
  id: "@manifest-editor/empty-annotation-page",
  create: createEmptyAnnotationPage,
  label: "Empty annotation page",
  summary: "AnnotationPage with nothing",
  icon: <ThumbnailStripIcon />,
  resourceType: "AnnotationPage",
  resourceFields: ["id", "type", "items"],
  supports: {
    parentTypes: ["Manifest", "Canvas", "Range"],
    parentFieldMap: {
      Manifest: ["annotations"],
      Canvas: ["items", "annotations"],
      Range: ["annotations"],
    },
  },
};

async function createEmptyAnnotationPage(data: unknown, ctx: CreatorFunctionContext) {
  return ctx.embed({
    id: ctx.generateId("annotations"),
    type: "AnnotationPage",
    items: [],
  });
}

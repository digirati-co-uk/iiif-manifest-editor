import { canvasLayouts, CANVAS_LAYOUT_META, createCanvasLayoutState } from "@manifest-editor/editor-api";
import { CanvasLayoutForm, type CanvasLayoutPayload } from "@manifest-editor/editors";
import { EmptyCanvasIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/empty-canvas": typeof emptyCanvas;
    }
  }
}

export const emptyCanvas = defineCreator({
  id: "@manifest-editor/empty-canvas",
  create: (data: CanvasLayoutPayload, ctx) => {
    const canvasId = ctx.generateId("canvas");
    const page = ctx.embed({
      id: ctx.generateId("annotation-page", { id: canvasId, type: "Canvas" }),
      type: "AnnotationPage",
      items: [],
    });

    const resource = ctx.embed({
      id: canvasId,
      type: "Canvas",
      label: data.label || { en: [""] },
      height: data.height || 2000,
      width: data.width || 3000,
      items: [page],
    });
    const layout = canvasLayouts.find((layout) => layout.id === data.layoutId);
    if (layout) resource.meta[CANVAS_LAYOUT_META] = { state: createCanvasLayoutState(layout) };
    return resource;
  },
  render: (ctx) => <CanvasLayoutForm runCreate={ctx.runCreate} />,
  label: "Empty canvas",
  summary: "Start with an image layout or a blank canvas",
  icon: <EmptyCanvasIcon />,
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "height", "width", "items"],
  supports: {
    parentTypes: ["Manifest"],
    parentFields: ["items"],
  },
});

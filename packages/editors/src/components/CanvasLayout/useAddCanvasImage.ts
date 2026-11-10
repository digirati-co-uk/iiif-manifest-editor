import {
  EditorInstance,
  beginCanvasComposition,
  getCanvasLayout,
  getEmptyCanvasPlaceholders,
  layoutSlotToPixels,
  type CanvasPlaceholder,
} from "@manifest-editor/editor-api";
import { useLayoutActions } from "@manifest-editor/shell";
import { useCanvas, useVault } from "react-iiif-vault";

/** The normal image creator, optionally scoped to a placeholder or the IIIF Browser. */
export function useAddCanvasImage() {
  const canvas = useCanvas();
  const vault = useVault();
  const { create } = useLayoutActions();
  return async (slot?: CanvasPlaceholder, browser = false, replaceAnnotationId?: string) => {
    if (!canvas) return;
    if (!slot && getCanvasLayout(vault, canvas.id)?.customised === false) {
      slot = getEmptyCanvasPlaceholders(vault, canvas)[0];
      if (!slot) return;
    }
    beginCanvasComposition(vault, canvas);
    let page = canvas.items[0];
    if (!page) {
      const id = `${canvas.id}/painting/${crypto.randomUUID()}`;
      await vault.load(id, { id, type: "AnnotationPage", items: [] });
      page = { id, type: "AnnotationPage" };
      new EditorInstance({ vault, reference: canvas }).structural.items.add(page);
    }
    create({
      type: "Annotation",
      parent: page,
      property: "items",
      target: { id: canvas.id, type: "Canvas" },
      isPainting: true,
      filter: "image",
      initialCreator: browser ? "@manifest-editor/iiif-browser-creator" : undefined,
      placeholderPosition: slot
        ? {
            canvasId: canvas.id,
            bounds: layoutSlotToPixels(slot.bounds, canvas),
            placeholderId: slot.id,
            replaceAnnotationId,
          }
        : undefined,
      initialData: { skipEditingOnCreate: true },
    });
  };
}

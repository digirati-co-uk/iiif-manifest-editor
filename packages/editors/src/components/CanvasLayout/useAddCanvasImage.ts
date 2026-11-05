import type { Vault } from "@iiif/helpers/vault";
import { layoutSlotToPixels, type CanvasPlaceholder } from "@manifest-editor/editor-api";
import { useLayoutActions } from "@manifest-editor/shell";
import { useCanvas } from "react-iiif-vault";

/** The normal image creator, optionally scoped to a placeholder or the IIIF Browser. */
export function useAddCanvasImage(sourceVault?: Vault) {
  const selectedCanvas = useCanvas();
  const canvas =
    sourceVault && selectedCanvas ? sourceVault.get({ id: selectedCanvas.id, type: "Canvas" }) : selectedCanvas;
  const { create } = useLayoutActions();
  return async (slot?: CanvasPlaceholder, browser = false) => {
    if (!canvas) return;
    let page = canvas.items[0];
    if (!page) {
      const id = `${canvas.id}/painting/${crypto.randomUUID()}`;
      page = { id, type: "AnnotationPage" };
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
        ? { canvasId: canvas.id, bounds: layoutSlotToPixels(slot.bounds, canvas), placeholderId: slot.id }
        : undefined,
      initialData: {
        skipEditingOnCreate: true,
        ensurePaintingPage: canvas.items.length ? undefined : { canvasId: canvas.id, pageId: page.id },
      },
    });
  };
}

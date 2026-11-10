import type { Vault } from "@iiif/helpers/vault";
import {
  getCanvasLayout,
  getEmptyCanvasPlaceholders,
  layoutSlotToPixels,
  type CanvasPlaceholder,
} from "@manifest-editor/editor-api";
import { useLayoutActions } from "@manifest-editor/shell";
import { useVault, useCanvas } from "react-iiif-vault";

/** The normal image creator, optionally scoped to a placeholder or the IIIF Browser. */
export function useAddCanvasImage(sourceVault?: Vault) {
  const liveVault = useVault();
  const vault = sourceVault || liveVault;
  const selectedCanvas = useCanvas();
  const canvas =
    sourceVault && selectedCanvas ? sourceVault.get({ id: selectedCanvas.id, type: "Canvas" }) : selectedCanvas;
  const { create } = useLayoutActions();
  return async (slot?: CanvasPlaceholder, browser = false, replaceAnnotationId?: string) => {
    if (!canvas) return;
    if (!slot && getCanvasLayout(vault, canvas.id)?.customised === false) {
      slot = getEmptyCanvasPlaceholders(vault, canvas)[0];
      if (!slot) return;
    }
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
        ? {
            canvasId: canvas.id,
            bounds: layoutSlotToPixels(slot.bounds, canvas),
            placeholderId: slot.id,
            replaceAnnotationId,
          }
        : undefined,
      initialData: {
        skipEditingOnCreate: true,
        ensurePaintingPage: canvas.items.length ? undefined : { canvasId: canvas.id, pageId: page.id },
      },
    });
  };
}

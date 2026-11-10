import type { useAtlasStore } from "react-iiif-vault";

/**
 * The viewer keeps its zoom and pan while a resize is dragged (and does not rebuild its world), so a size change
 * that comes from a form or a restore has to refresh the world and bring the whole slide back into view.
 */
export function refitCanvasViewer(store: ReturnType<typeof useAtlasStore>, width: number, height: number) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const runtime = store.getState().runtime;
      if (!runtime) return;
      runtime.world.recalculateWorldSize();
      runtime.world.triggerRepaint();
      const margin = 0.06;
      runtime.setHomePosition({
        x: -width * margin,
        y: -height * margin,
        width: width * (1 + margin * 2),
        height: height * (1 + margin * 2),
      });
      runtime.goHome();
    })
  );
}

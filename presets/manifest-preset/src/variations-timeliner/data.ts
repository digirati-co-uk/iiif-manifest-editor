import { useManifest, useVaultSelector } from "react-iiif-vault";
import { getAvCanvases } from "../av-ranges/av-media-utils";
import { getBubbles, getMarkers } from "./model";
import { getPalette } from "./themes";
import { useTimelinerStore } from "./store";

/** Shared projection of the manifest used by the sidebar, centre panel and section editor. */
export function useTimelinerData() {
  const manifest = useManifest();
  const canvasId = useTimelinerStore((s) => s.canvasId);
  const palette = useTimelinerStore((s) => getPalette(s.palette));
  const canvases = useVaultSelector((_, v) => (manifest ? getAvCanvases(v, manifest) : []), [manifest]);
  const canvas = canvases.find((item) => item.id === canvasId) || canvases[0] || null;
  const bubbles = useVaultSelector(
    (_, v) => (manifest && canvas ? getBubbles(v, manifest, canvas.id) : []),
    [manifest, canvas?.id]
  );
  const markers = useVaultSelector(
    (_, v) => (manifest && canvas ? getMarkers(v, manifest, canvas.id) : []),
    [manifest, canvas?.id]
  );
  return { manifest, canvases, canvas, bubbles, markers, palette };
}

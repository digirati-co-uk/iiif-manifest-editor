import { useTranslations } from "@manifest-editor/i18n";
import {
  applyCanvasLayout,
  canResizeCanvas,
  clearCanvasPlaceholders,
  getEmptyCanvasPlaceholders,
  getCanvasLayout,
  getPaintingImages,
  getPaintingAnnotations,
} from "@manifest-editor/editor-api";
import { useAtlasStore, useCanvas, useVault, useVaultSelector } from "react-iiif-vault";
import { CanvasLayoutPicker } from "./CanvasLayoutPicker";

export function CanvasLayoutSection() {
  const t = useTranslations("editors");
  const canvas = useCanvas();
  const store = useAtlasStore();
  const vault = useVault();
  const state = useVaultSelector((_, v) => (canvas ? getCanvasLayout(v, canvas.id) : undefined), [canvas?.id]);
  const images = useVaultSelector((_, v) => (canvas ? getPaintingImages(v, canvas).length : 0), [canvas]);
  const placeholders = useVaultSelector(
    (_, v) => (canvas ? getEmptyCanvasPlaceholders(v, canvas).length : 0),
    [canvas]
  );
  if (!canvas || !canResizeCanvas(vault, canvas) || getPaintingAnnotations(vault, canvas).length !== images)
    return null;
  return (
    <div className="space-y-2">
      <CanvasLayoutPicker
        compact
        value={state?.layoutId}
        imageCount={images}
        aspectRatio={canvas.width / canvas.height}
        onChange={(layout) => {
          const current = store.getState();
          const requestId = current.tool.requestId;
          if (requestId && current.requests[requestId]?.arguments?.canvasComposition) current.cancelRequest(requestId);
          applyCanvasLayout(vault, canvas, layout);
        }}
      />
      {placeholders > 0 && (
        <button
          type="button"
          onClick={() => clearCanvasPlaceholders(vault, canvas)}
          style={{ marginTop: 10, background: "none", border: 0, padding: 0, color: "#892c4e", fontSize: 12 }}
        >
          {t("ui.clearPlaceholders")}
        </button>
      )}
    </div>
  );
}

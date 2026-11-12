import { CanvasPanelViewer } from "@manifest-editor/editors";
import type { CanvasEditorDefinition } from "@manifest-editor/shell";
import { Button } from "react-aria-components";
import { LocaleString, useCanvas, useManifest, useVault } from "react-iiif-vault";
import { isAudioCanvas } from "../audio-slide";
import { ensureAudioArtworkCanvas, getAudioArtworkCanvas } from "../audio-artwork";
import { ExhibitionPreviewPanel } from "../components/ExhibitionPreviewPanel";
import { useConfiguredExhibitionPreviewPreset } from "../helpers/exhibition-preview-state";
import { AudioArtworkCanvasScope } from "../right-panels/AudioArtworkPanel";
import { useSlideshowWorkbenchState } from "../slideshow-content-positioning";

export const audioCanvasEditor: CanvasEditorDefinition = {
  id: "exhibition-audio-canvas-editor",
  label: "Audio slide editor",
  component: () => <AudioCanvasWorkspace />,
  supports: { strategy: (_strategy, resource, vault) => isAudioCanvas(vault, vault.get(resource.resource)) },
};

/** The selected resource remains the Sound canvas; only the edit viewport enters its artwork context. */
export function AudioCanvasWorkspace() {
  const canvas = useCanvas();
  const manifest = useManifest();
  const vault = useVault();
  const mode = useSlideshowWorkbenchState((state) => state.centerPanelMode);
  const setMode = useSlideshowWorkbenchState((state) => state.setCenterPanelMode);
  const previewPreset = useConfiguredExhibitionPreviewPreset();
  const artwork = getAudioArtworkCanvas(vault, canvas);
  if (!canvas) return null;
  return (
    <div
      className="relative flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-white"
      data-audio-workspace
    >
      <div className="exhibition-slideshow-current-toolbar flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <LocaleString className="block truncate text-sm font-semibold text-slate-800">{canvas.label}</LocaleString>
          <p className="mt-1 text-xs text-slate-500">
            {mode === "edit" ? "Edit accompanying artwork" : "Preview audio slide"}
          </p>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {(["edit", "preview"] as const).map((value) => (
            <Button
              key={value}
              aria-pressed={mode === value}
              className={`px-3 py-2 text-xs font-semibold ${mode === value ? "bg-me-primary-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              onPress={() => setMode(value)}
            >
              {value === "edit" ? "Edit" : "Preview"}
            </Button>
          ))}
        </div>
      </div>
      {mode === "preview" ? (
        <div className="min-h-0 flex-1">
          <ExhibitionPreviewPanel
            preset={previewPreset}
            presetOptions={{ manifest: manifest?.id || "", canvas: canvas.id }}
          />
        </div>
      ) : artwork ? (
        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden" data-audio-artwork-canvas={artwork.id}>
          <AudioArtworkCanvasScope canvasId={artwork.id}>
            <CanvasPanelViewer asFallback enableAddMedia moveMode />
          </AudioArtworkCanvasScope>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-8">
          <div className="max-w-md rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">Add artwork for this recording</h3>
            <p className="mt-2 text-sm text-slate-600">
              Create an accompanying image canvas, then add images from a URL or the IIIF Browser. The recording stays
              on its own canvas.
            </p>
            <Button
              className="mt-5 rounded bg-me-primary-500 px-4 py-2 text-sm font-semibold text-white"
              onPress={() => ensureAudioArtworkCanvas(vault, canvas)}
            >
              Add accompanying images
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

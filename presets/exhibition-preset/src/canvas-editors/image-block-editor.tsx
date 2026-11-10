import { getCanvasLayout, getPaintingAnnotations } from "@manifest-editor/editor-api";
import { CanvasPanelEditor, useInStack } from "@manifest-editor/editors";
import type { CanvasEditorDefinition } from "@manifest-editor/shell";
import { useEffect } from "react";
import { Button } from "react-aria-components";
import { CanvasContext, LocaleString, type RenderingStrategy, useCanvas, useVaultSelector } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { ExhibitionPreviewPanel } from "../components/ExhibitionPreviewPanel";
import { useConfiguredExhibitionPreviewPreset } from "../helpers/exhibition-preview-state";
import { useSlideshowWorkbenchState } from "../slideshow-content-positioning";

export const imageBlockEditor: CanvasEditorDefinition = {
  id: "image-block-editor",
  label: "Exhibition canvas editor",
  component: (strategy) => <ImageBlockEditor strategy={strategy} />,
  supports: {
    strategy: (strategy, resource, vault) => {
      if (strategy.type !== "images" && strategy.type !== "empty") {
        return false;
      }

      const fullResource = vault.get(resource.resource);
      return fullResource?.type === "Canvas";
    },
  },
};

export function ImageBlockEditor({ strategy: _strategy }: { strategy: RenderingStrategy }) {
  const centerPanelMode = useSlideshowWorkbenchState((state) => state.centerPanelMode);
  const setCenterPanelMode = useSlideshowWorkbenchState((state) => state.setCenterPanelMode);
  const previewPreset = useConfiguredExhibitionPreviewPreset();
  const canvas = useInStack("Canvas");
  const canvasId = canvas?.resource.source?.id;
  const emptyLayout = useVaultSelector(
    (_, vault) => {
      if (!canvasId) return false;
      const resource = vault.get({ id: canvasId, type: "Canvas" });
      return !!getCanvasLayout(vault, canvasId) && !getPaintingAnnotations(vault, resource).length;
    },
    [canvasId]
  );
  useEffect(() => {
    if (emptyLayout) setCenterPanelMode("edit");
  }, [canvasId, emptyLayout, setCenterPanelMode]);

  if (!canvas) {
    return null;
  }

  return (
    <CanvasContext canvas={canvas.resource.source?.id}>
      <ImageBlockEditorContent
        isPreview={centerPanelMode === "preview"}
        previewPreset={previewPreset}
        onModeChange={(nextIsPreview) => {
          setCenterPanelMode(nextIsPreview ? "preview" : "edit");
        }}
      />
    </CanvasContext>
  );
}

function ImageBlockEditorContent({
  isPreview,
  previewPreset,
  onModeChange,
}: {
  isPreview: boolean;
  previewPreset: ReturnType<typeof useConfiguredExhibitionPreviewPreset>;
  onModeChange: (isPreview: boolean) => void;
}) {
  const canvas = useCanvas();

  return (
    <div className="relative z-0 flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden bg-white">
      <div className="exhibition-slideshow-current-toolbar flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <LocaleString className="block truncate text-sm font-semibold text-slate-800">{canvas?.label}</LocaleString>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold">
            <ModeButton selected={!isPreview} onPress={() => onModeChange(false)}>
              Edit
            </ModeButton>
            <ModeButton selected={isPreview} onPress={() => onModeChange(true)}>
              Preview
            </ModeButton>
          </div>
        </div>
      </div>
      {isPreview ? (
        <div className="min-h-0 flex-1">
          <ExhibitionPreviewPanel preset={previewPreset} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          <CanvasPanelEditor enableAddMedia asFallback moveMode />
        </div>
      )}
    </div>
  );
}

function ModeButton({ children, selected, onPress }: { children: string; selected: boolean; onPress: () => void }) {
  return (
    <Button
      className={twMerge(
        "px-3 py-2 text-xs font-semibold transition",
        selected ? "bg-me-primary-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
      )}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}

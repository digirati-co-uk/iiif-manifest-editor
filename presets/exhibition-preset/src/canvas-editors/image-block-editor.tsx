import { CanvasPanelEditor, useInStack } from "@manifest-editor/editors";
import type { CanvasEditorDefinition } from "@manifest-editor/shell";
import { useLocalStorage } from "@manifest-editor/shell";
import { Button } from "react-aria-components";
import { CanvasContext, LocaleString, type RenderingStrategy, useCanvas } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { ExhibitionPreviewPanel } from "../components/ExhibitionPreviewPanel";
import { useConfiguredExhibitionPreviewPreset } from "../helpers/exhibition-preview-state";

export const imageBlockEditor: CanvasEditorDefinition = {
  id: "image-block-editor",
  label: "Image Block Editor",
  component: (strategy) => <ImageBlockEditor strategy={strategy} />,
  supports: {
    strategy: (strategy, resource, vault) => {
      if (strategy.type !== "images") {
        return false;
      }

      const fullResource = vault.get(resource.resource);
      if (fullResource.type !== "Canvas") {
        return false;
      }

      const behaviors = fullResource.behavior || [];

      let isImage = false;
      for (const behaviour of behaviors) {
        if (behaviour.startsWith("w-") || behaviour.startsWith("h-") || behaviour === "image") {
          isImage = true;
        }
      }

      return isImage;
    },
  },
};

export function ImageBlockEditor({ strategy: _strategy }: { strategy: RenderingStrategy }) {
  const [isPreview, setIsPreview] = useLocalStorage("exhibition-preview-mode");
  const previewPreset = useConfiguredExhibitionPreviewPreset();
  const canvas = useInStack("Canvas");
  if (!canvas) {
    return null;
  }

  return (
    <CanvasContext canvas={canvas.resource.source?.id}>
      <ImageBlockEditorContent
        isPreview={!!isPreview}
        previewPreset={previewPreset}
        onModeChange={setIsPreview}
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
          <CanvasPanelEditor asFallback />
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
        selected ? "bg-me-primary-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700",
      )}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}

import type {
  CanvasEditorDefinition,
  EditableResource,
} from "@manifest-editor/shell";
import { useLayoutActions, useLayoutState } from "@manifest-editor/shell";
import {
  CanvasPanelEditor,
  useAnnotationEditing,
} from "@manifest-editor/editors";
import { useState } from "react";
import { Button } from "react-aria-components";
import {
  CanvasContext,
  LocaleString,
  type RenderingStrategy,
  useCanvas,
  useCurrentAnnotationRequest,
  useManifest,
} from "react-iiif-vault";
import { SlideshowSlidePreview } from "../components/SlideshowSlidePreview";
import { isExhibitionItem } from "../helpers";

export const slideshowCanvasEditor: CanvasEditorDefinition = {
  id: "slideshow-canvas-editor",
  label: "Slideshow canvas editor",
  component: () => <SlideshowCanvasEditor />,
  supports: {
    strategy: (
      _strategy: RenderingStrategy,
      resource: EditableResource,
      vault,
    ) => {
      const canvas = vault.get(resource.resource);
      return canvas?.type === "Canvas" && isExhibitionItem(canvas as any);
    },
  },
};

function SlideshowCanvasEditor() {
  const canvas = useCanvas();
  const manifest = useManifest();
  const { edit } = useLayoutActions();
  const { rightPanel } = useLayoutState();
  const request = useCurrentAnnotationRequest();
  const editingAnnotationId = useAnnotationEditing(
    (state) => state.annotationId,
  );
  const [zoom, setZoom] = useState(1);
  const currentCanvasIndex = manifest?.items?.findIndex(
    (item) => item.id === canvas?.id,
  );
  const previousCanvas =
    typeof currentCanvasIndex === "number"
      ? manifest?.items?.[currentCanvasIndex - 1]
      : undefined;
  const nextCanvas =
    typeof currentCanvasIndex === "number"
      ? manifest?.items?.[currentCanvasIndex + 1]
      : undefined;

  if (!canvas) {
    return null;
  }

  if (
    request ||
    editingAnnotationId ||
    (rightPanel.current === "@manifest-editor/editor" &&
      rightPanel.state?.currentTab?.startsWith("@exhibition/tour-steps"))
  ) {
    return <CanvasPanelEditor asFallback />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <LocaleString className="block truncate text-sm font-semibold text-slate-800">
            {canvas.label}
          </LocaleString>
        </div>
        <div className="flex items-center gap-2">
          <ControlButton onPress={() => setZoom(1)}>Home</ControlButton>
          <ControlButton
            onPress={() => setZoom((value) => Math.max(0.25, value - 0.25))}
          >
            -
          </ControlButton>
          <ControlButton
            onPress={() => setZoom((value) => Math.min(3, value + 0.25))}
          >
            +
          </ControlButton>
          <ControlButton
            isDisabled={!previousCanvas}
            onPress={() =>
              previousCanvas &&
              edit({ id: previousCanvas.id, type: "Canvas" }, undefined, {
                forceOpen: false,
              })
            }
          >
            Previous
          </ControlButton>
          <ControlButton
            isDisabled={!nextCanvas}
            onPress={() =>
              nextCanvas &&
              edit({ id: nextCanvas.id, type: "Canvas" }, undefined, {
                forceOpen: false,
              })
            }
          >
            Next
          </ControlButton>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-8">
        <div
          className="mx-auto origin-top overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/10"
          style={{
            width: "min(100%, 1200px)",
            aspectRatio: `${canvas.width || 1920} / ${canvas.height || 1080}`,
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          <CanvasContext canvas={canvas.id}>
            <SlideshowSlidePreview />
          </CanvasContext>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  children,
  isDisabled,
  onPress,
}: {
  children: string;
  isDisabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}

import type { RangeTableOfContentsNode } from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import { ViewControls } from "@manifest-editor/ui/ViewControls";
import { useMemo } from "react";
import { Button } from "react-aria-components";
import {
  CanvasContext,
  CanvasPanel,
  LocaleString,
  useCanvas,
} from "react-iiif-vault";
import { ArrowBackwardIcon, ArrowForwardIcon } from "../../icons";

export function RangeWorkbenchCanvas(props: {
  range: RangeTableOfContentsNode;
  canvas: RangeTableOfContentsNode;
  onBack: () => void;
  setCanvas: (canvas: RangeTableOfContentsNode) => void;
}) {
  const canvasRef = toRef(props.canvas.resource);
  const canvasId = props.canvas.id ?? canvasRef?.id ?? null;
  const items = props.range.items || [];

  const currentIndex = useMemo(() => {
    if (!canvasId) return -1;
    return items.findIndex((item) => item.id === canvasId);
  }, [items, canvasId]);

  const nextCanvas = useMemo<RangeTableOfContentsNode | null>(() => {
    if (currentIndex === -1) return null;
    for (let i = currentIndex + 1; i < items.length; i++) {
      const candidate = items[i];
      if (candidate?.type === "Canvas") {
        return candidate as RangeTableOfContentsNode;
      }
    }
    return null;
  }, [items, currentIndex]);

  const previousCanvas = useMemo<RangeTableOfContentsNode | null>(() => {
    if (currentIndex <= 0) return null;
    for (let i = currentIndex - 1; i >= 0; i--) {
      const candidate = items[i];
      if (candidate?.type === "Canvas") {
        return candidate as RangeTableOfContentsNode;
      }
    }
    return null;
  }, [items, currentIndex]);

  const onNextCanvas = nextCanvas
    ? () => props.setCanvas(nextCanvas)
    : undefined;
  const onPreviousCanvas = previousCanvas
    ? () => props.setCanvas(previousCanvas)
    : undefined;

  if (!canvasRef && !canvasId) {
    return <div>No canvas preview available</div>;
  }

  const ctxCanvasId = canvasRef?.id ?? canvasId!;

  return (
    <div className="relative w-full h-[90vh] flex flex-col">
      <Button
        onPress={props.onBack}
        className="absolute top-3 left-3 z-20 bg-white/90 px-3 py-3 rounded shadow hover:bg-gray-100 text-sm"
      >
        Close
      </Button>

      <CanvasContext canvas={ctxCanvasId}>
        <CanvasPanel.Viewer className="h-[90vh]">
          <CanvasPanel.RenderCanvas
            renderViewerControls={() => (
              <>
                <ViewControls editIcon />
                <CanvasViewerNavigation
                  enableNavigation={true}
                  onNext={onNextCanvas}
                  onPrevious={onPreviousCanvas}
                />
              </>
            )}
            viewControlsDeps={[onNextCanvas, onPreviousCanvas]}
          />
        </CanvasPanel.Viewer>
      </CanvasContext>
    </div>
  );
}

function CanvasViewerNavigation(props: {
  enableNavigation: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  const canvas = useCanvas();
  if (!props.enableNavigation) {
    return null;
  }
  return (
    <div className="bg-transparent absolute bottom-4 left-4 right-4 pointer-events-none flex items-center justify-center">
      <div className="bg-white/90 gap-2 inline-flex mx-auto pointer-events-auto items-center gap-4 rounded overflow-hidden shadow-md">
        <Button
          isDisabled={!props.onPrevious}
          onClick={props.onPrevious}
          className="p-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ArrowBackwardIcon className="text-2xl" />
          <span className="sr-only">Previous</span>
        </Button>
        <LocaleString className="text-center w-[120px] text-sm truncate overflow-ellipsis">
          {canvas?.label}
        </LocaleString>
        <Button
          isDisabled={!props.onNext}
          onClick={props.onNext}
          className="p-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ArrowForwardIcon className="text-2xl" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
}

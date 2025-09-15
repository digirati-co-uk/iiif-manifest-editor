import type { RangeTableOfContentsNode } from "@iiif/helpers";
import { toRef } from "@iiif/parser";
import { ViewControls } from "@manifest-editor/ui/ViewControls";
import { useMemo } from "react";
import { CanvasContext, CanvasPanel, useCanvas } from "react-iiif-vault";

export function RangeWorkbenchCanvas(props: {
  range: RangeTableOfContentsNode;
  canvas: RangeTableOfContentsNode;
  onBack: () => void;
  setCanvas: (canvas: RangeTableOfContentsNode) => void;
}) {
  const canvasRef = toRef(props.canvas.resource);

  const nextCanvas = useMemo(() => {
    const items = props.range.items || [];
    const idx = items.findIndex((item) => toRef(item)?.id === canvasRef?.id);

    if (idx === -1) {
      return null;
    }

    return items[idx + 1];
  }, [props.range, canvasRef]);

  const previousCanvas = useMemo(() => {
    const items = props.range.items || [];
    const idx = items.findIndex((item) => toRef(item)?.id === canvasRef?.id);
    if (idx === -1 || idx === 0) {
      return null;
    }

    return items[idx - 1];
  }, [props.range, canvasRef]);

  const onNextCanvas = nextCanvas ? () => props.setCanvas(nextCanvas) : undefined;
  const onPreviousCanvas = previousCanvas ? () => props.setCanvas(previousCanvas) : undefined;

  if (!canvasRef) {
    return <div>No canvas preview available</div>;
  }

  return (
    <div className="w-full h-[90vh] flex flex-col">
      <CanvasContext canvas={canvasRef.id}>
        <CanvasPanel.Viewer className="h-[90vh]">
          <CanvasPanel.RenderCanvas
            renderViewerControls={() => (
              <ViewControls
                editIcon
                enableNavigation={!!(onNextCanvas || onPreviousCanvas)}
                onNext={onNextCanvas}
                onPrevious={onPreviousCanvas}
              />
            )}
            viewControlsDeps={[onNextCanvas, onPreviousCanvas]}
          />
        </CanvasPanel.Viewer>
      </CanvasContext>
    </div>
  );
}

import { CanvasForm } from "@/editors/CanvasProperties/CanvasForm";
import { CanvasContext } from "react-iiif-vault";

export function CanvasProperties({
  canvasId,
  currentPanel,
  setCurrentPanel,
}: {
  canvasId?: string;
  currentPanel?: number;
  setCurrentPanel: (idx: number) => void;
}) {
  if (!canvasId) {
    return <div>Please choose canvas</div>;
  }

  return (
    <CanvasContext canvas={canvasId}>
      <CanvasForm current={currentPanel || 0} setCurrent={setCurrentPanel} />
    </CanvasContext>
  );
}

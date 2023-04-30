import { CanvasContext } from "react-iiif-vault";
import { CanvasView } from "@/components/organisms/CanvasView";
import { useAppState } from "@/shell";

export function CurrentCanvas() {
  const { state } = useAppState();

  return (
    <CanvasContext canvas={state.canvasId}>
      <CanvasView />
    </CanvasContext>
  );
}

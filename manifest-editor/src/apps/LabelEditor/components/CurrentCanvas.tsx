import { useLayoutProvider } from "../../../shell/Layout/Layout.context";
import { CanvasContext } from "react-iiif-vault";
import { CanvasView } from "../../../components/organisms/CanvasView";

export function CurrentCanvas() {
  const { state } = useLayoutProvider();
  const canvasId = state.rightPanel.state?.id;

  return (
    <CanvasContext canvas={canvasId}>
      <CanvasView />
    </CanvasContext>
  );
}

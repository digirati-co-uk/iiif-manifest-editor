import { CanvasContext, useManifest } from "react-iiif-vault";
import { useLayoutState } from "../../../shell/Layout/Layout.context";
import { SingleCanvas } from "./SingleCanvas";

export function CanvasList() {
  const manifest = useManifest();
  const { rightPanel } = useLayoutState();

  const isLabelEditor = rightPanel.current === "label-editor";

  if (!manifest) {
    return null;
  }

  return (
    <div style={{ padding: "1em" }}>
      {manifest.items.map((canvas) => {
        return (
          <CanvasContext canvas={canvas.id}>
            <SingleCanvas selected={isLabelEditor && rightPanel.state && rightPanel.state.id === canvas.id} />
          </CanvasContext>
        );
      })}
    </div>
  );
}

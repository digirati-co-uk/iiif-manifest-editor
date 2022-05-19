import { CanvasContext, useManifest } from "react-iiif-vault";
import { useLayoutProvider } from "../../../shell/Layout/Layout.context";
import equal from "shallowequal";
import { SingleCanvas } from "./SingleCanvas";

export function CanvasList() {
  const manifest = useManifest();
  const { state } = useLayoutProvider();

  const isLabelEditor = state.rightPanel.current === "label-editor";

  if (!manifest) {
    return null;
  }

  return (
    <div style={{ padding: "1em" }}>
      {manifest.items.map((canvas) => {
        return (
          <CanvasContext canvas={canvas.id}>
            <SingleCanvas
              selected={isLabelEditor && state.rightPanel.state && state.rightPanel.state.id === canvas.id}
            />
          </CanvasContext>
        );
      })}
    </div>
  );
}

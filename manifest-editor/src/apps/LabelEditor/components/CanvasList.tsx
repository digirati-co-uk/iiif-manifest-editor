import { CanvasContext, useManifest } from "react-iiif-vault";
import { useLayoutState } from "@/shell";
import { SingleCanvas } from "./SingleCanvas";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";

export function CanvasList() {
  const manifest = useManifest();
  const { rightPanel } = useLayoutState();

  const isLabelEditor = rightPanel.current === "label-editor";

  if (!manifest) {
    return null;
  }

  return (
    <PaddedSidebarContainer>
      {manifest.items.map((canvas) => {
        return (
          <CanvasContext canvas={canvas.id}>
            <SingleCanvas selected={isLabelEditor && rightPanel.state && rightPanel.state.id === canvas.id} />
          </CanvasContext>
        );
      })}
    </PaddedSidebarContainer>
  );
}

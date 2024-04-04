import { CanvasContext, useManifest } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { CanvasListItem } from "./components/CanvasListItem";
import { CanvasListStyles } from "./CanvasList.styles";
import { useCanvasSubset } from "@/hooks/useCanvasSubset";

export function CanvasList({ canvasIds }: { canvasIds?: string[] }) {
  const manifest = useManifest();
  const canvases = useCanvasSubset(canvasIds);

  invariant(manifest, "No manifest selected");

  return (
    <CanvasListStyles.Container>
      {canvases.map((canvas) => (
        <CanvasContext key={canvas.id} canvas={canvas.id}>
          <CanvasListItem />
        </CanvasContext>
      ))}
    </CanvasListStyles.Container>
  );
}

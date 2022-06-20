import { CanvasContext, useManifest } from "react-iiif-vault";
import invariant from "tiny-invariant";
import { getValue } from "@iiif/vault-helpers";
import { CanvasListItem } from "./components/CanvasListItem";
import { CanvasListStyles } from "./CanvasList.styles";

export function CanvasList() {
  const manifest = useManifest();

  invariant(manifest, "No manifest selected");

  return (
    <CanvasListStyles.Container>
      {manifest.items.map((canvas) => (
        <CanvasContext key={canvas.id} canvas={canvas.id}>
          <CanvasListItem />
        </CanvasContext>
      ))}
    </CanvasListStyles.Container>
  );
}

import { CanvasContext, useManifest, useSimpleViewer, useVault, VisibleCanvasReactContext } from "react-iiif-vault";
import { SingleCanvasThumbnail } from "../SingleCanvasThumbnail/SingleCanvasThumbnail";
import { ThumbnailViewer, Thumbnail, ThumbnailCover } from "./ThumbnailPageList.styles";
import { useContext, useLayoutEffect } from "react";
import { CanvasNormalized } from "@iiif/presentation-3";

export function ThumbnailPagedList() {
  const manifest = useManifest();
  const ids = useContext<string[]>(VisibleCanvasReactContext);
  const { currentCanvasIndex, setCurrentCanvasId } = useSimpleViewer();
  const vault = useVault();

  useLayoutEffect(() => {
    const found = document.querySelector(`[data-canvas-thumbnail-index="${currentCanvasIndex}"]`);
    if (found) {
      found.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [currentCanvasIndex]);

  return (
    <ThumbnailViewer>
      {manifest.items.map((canvasRef, idx) => {
        const canvas = vault.get<CanvasNormalized>(canvasRef);

        const T = canvas.behavior.indexOf("non-paged") !== -1 || idx === 0 ? ThumbnailCover : Thumbnail;

        return (
          <CanvasContext key={canvas.id} canvas={canvas.id}>
            <T
              $active={ids.indexOf(canvas.id) !== -1}
              onClick={() => setCurrentCanvasId(canvas.id)}
              data-canvas-thumbnail-index={idx}
            >
              <SingleCanvasThumbnail size={128} />
            </T>
          </CanvasContext>
        );
      })}
    </ThumbnailViewer>
  );
}

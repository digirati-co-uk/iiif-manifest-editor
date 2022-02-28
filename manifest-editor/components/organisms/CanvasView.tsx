import React, { useRef, useEffect } from "react";
import { useCanvas } from "react-iiif-vault";
// import("@digirati/canvas-panel-web-components");
import { CanvasContainer } from "../layout/CanvasContainer";
import { useManifest } from "../../hooks/useManifest";

export const CanvasView: React.FC = () => {
  const viewer = useRef();
  const canvas = useCanvas();
  const manifest = useManifest();

  // // required for next js ssr
  // useEffect(async () => {
  //   await import("@digirati/canvas-panel-web-components");
  //   // console.log(viewer);
  //   console.log(canvas);
  //   console.log(manifest);
  // }, []);

  return (
    <CanvasContainer>
      <canvas-panel
        ref={viewer}
        canvas-id={canvas?.id}
        manifest-id={manifest?.id}
      />
    </CanvasContainer>
  );
};

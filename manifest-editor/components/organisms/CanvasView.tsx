import React, { useRef, useEffect } from "react";
import { useCanvas } from "react-iiif-vault";
import("@digirati/canvas-panel-web-components");
import { CanvasContainer } from "../layout/CanvasContainer";

export const CanvasView: React.FC<{manifest: string}> = (manifest) => {
  const viewer = useRef();
  const canvas = useCanvas();

  // required for next js ssr
  // useEffect(() => {
  //   import("@digirati/canvas-panel-web-components");
  // }, []);

  return (
    <CanvasContainer>
      {/* <canvas-panel
        ref={viewer}
        canvas-id={canvas?.id}
        manifest-id={manifest}
      /> */}
    </CanvasContainer>
  );
};

import React, { useRef, useEffect } from "react";
import { useCanvas } from "react-iiif-vault";
import { CanvasContainer } from "../layout/CanvasContainer";
import { useManifest } from "../../hooks/useManifest";

export const CanvasView: React.FC = () => {
  const viewer = useRef();
  const canvas = useCanvas();
  const manifest = useManifest();

  // // required for next js ssr
  useEffect(() => {
    import("@digirati/canvas-panel-web-components");
  }, []);

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

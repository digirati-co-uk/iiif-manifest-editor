import React, { useRef, useEffect } from "react";
import { useCanvas } from "@hyperion-framework/react-vault";

import { CanvasContainer } from "../atoms/CanvasContainer";

export const CanvasView: React.FC<{manifest: string}> = (manifest) => {
  const viewer = useRef();
  const canvas = useCanvas();
  console.log(manifest.manifest);

  // required for next js ssr
  useEffect(() => {
    import("@digirati/canvas-panel-web-components");
  }, []);

  return (
    <CanvasContainer>
      <canvas-panel
        ref={viewer}
        canvas-id={canvas?.id}
        manifest-id={manifest.manifest}
      />
    </CanvasContainer>
  );
};

import React, { useRef, useEffect } from "react";
import { useCanvas } from "@hyperion-framework/react-vault";

export const CanvasView: React.FC = () => {
  const viewer = useRef();
  const canvas = useCanvas();
  // required for next js ssr
  useEffect(() => {
    import("@digirati/canvas-panel-web-components")
  }, [])

  return <canvas-panel ref={viewer} iiif-content={canvas?.id} />;
};

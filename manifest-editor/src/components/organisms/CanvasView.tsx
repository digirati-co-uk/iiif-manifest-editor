import React, { useRef } from "react";
import { useCanvas } from "react-iiif-vault";
import { CanvasContainer, GhostCanvas } from "../layout/CanvasContainer";
import { useManifest } from "../../hooks/useManifest";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import "@digirati/canvas-panel-web-components";

export const CanvasView: React.FC = () => {
  const viewer = useRef();
  const canvas = useCanvas();
  const manifest = useManifest();

  if (!canvas) {
    return (
      <CanvasContainer>
        <GhostCanvas />
      </CanvasContainer>
    );
  }

  if (!manifest || manifest.id === "") {
    return <></>;
  }

  // TO DO REMOVE THIS FILE NO LONGER IN USE - used by label editor app!!
  return (
    <CanvasContainer key={canvas?.id} style={{ padding: 0 }}>
      <style>{`
          canvas-panel {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;

            --atlas-container-flex: 1 1 0px;
            --atlas-background:  #E5E7F0;
          }
      `}</style>
      <ErrorBoundary>
        <canvas-panel ref={viewer} canvas-id={canvas?.id} manifest-id={manifest?.id} key={canvas?.id} />
      </ErrorBoundary>
    </CanvasContainer>
  );
};

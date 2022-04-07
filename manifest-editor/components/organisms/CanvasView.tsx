import React, { useRef, useEffect } from "react";
import { useCanvas } from "react-iiif-vault";
import { CanvasContainer, GhostCanvas } from "../layout/CanvasContainer";
import { useManifest } from "../../hooks/useManifest";
import { ErrorBoundary } from "../atoms/ErrorBoundary";

export const CanvasView: React.FC = () => {
  const viewer = useRef();
  const canvas = useCanvas();
  const manifest = useManifest();

  if (!canvas) {
    return (
      <CanvasContainer>
        <GhostCanvas></GhostCanvas>
      </CanvasContainer>
    );
  }

  if (!manifest || manifest.id === "") {
    return <></>;
  }
  return (
    <CanvasContainer key={canvas?.id}>
      <ErrorBoundary>
        <canvas-panel
          ref={viewer}
          canvas-id={canvas?.id}
          manifest-id={manifest?.id}
        />
      </ErrorBoundary>
    </CanvasContainer>
  );
};

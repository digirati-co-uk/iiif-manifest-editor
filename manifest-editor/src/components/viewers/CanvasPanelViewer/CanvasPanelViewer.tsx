import { CanvasPanel, CanvasContext, useCanvas, useManifest } from "react-iiif-vault";
import styled from "styled-components";
import { useAppState } from "../../../shell/AppContext/AppContext";
import React, { useEffect, useReducer, useRef } from "react";
import { Runtime } from "@atlas-viewer/atlas";
import { ViewControls } from "./components/ViewControls";
import { ErrorBoundary } from "react-error-boundary";
import { CanvasContainer, GhostCanvas } from "../../layout/CanvasContainer";
import { BlockIcon } from "../../../icons/BlockIcon";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../../atoms/PaddingComponent";
import { EmptyCanvasState } from "../../organisms/EmptyCanvasState/EmptyCanvasState";

const Container = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
`;

export const ViewerContainer = styled.div`
  display: flex;
  flex: 1 1 0px;
  flex-direction: column;
  min-width: 0;
`;

export function CanvasPanelViewer() {
  const { state } = useAppState();
  const runtime = useRef<Runtime>();
  const manifest = useManifest(); // @todo remove.

  const [refreshKey, refresh] = useReducer((s) => s + 1, 0);

  const goHome = () => runtime.current?.world.goHome();
  const zoomIn = () => runtime.current?.world.zoomTo(0.75);
  const zoomOut = () => runtime.current?.world.zoomTo(1 / 0.75);

  useEffect(() => {
    runtime.current?.goHome();
  }, [state.canvas]);

  if (manifest?.items.length === 0) {
    return <EmptyCanvasState />;
  }

  if (!state.canvas) {
    return (
      <CanvasContainer>
        <GhostCanvas>
          <BlockIcon color="grey" />
          <PaddingComponentSmall> No canvas selected </PaddingComponentSmall>
          <PaddingComponentMedium />
          <PaddingComponentSmall>Manage your canvases on the left </PaddingComponentSmall>
          <PaddingComponentSmall>Edit your manifest properties on the right</PaddingComponentSmall>
        </GhostCanvas>
      </CanvasContainer>
    );
  }

  return (
    <ErrorBoundary
      resetKeys={[state.canvas, refreshKey]}
      fallbackRender={() => (
        <CanvasContainer>
          <GhostCanvas />
        </CanvasContainer>
      )}
    >
      <Container key={refreshKey}>
        <ViewControls goHome={goHome} zoomIn={zoomIn} zoomOut={zoomOut} refresh={refresh} />
        <style>{`
        .atlas-container {
          min-width: 0;
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  #f9f9f9;
        }
      `}</style>
        <ViewerContainer>
          <CanvasPanel.Viewer key={state.canvas} onCreated={(preset) => void (runtime.current = preset.runtime)}>
            <CanvasContext canvas={state.canvas}>
              <CanvasPanel.RenderCanvas />
            </CanvasContext>
          </CanvasPanel.Viewer>
        </ViewerContainer>
      </Container>
    </ErrorBoundary>
  );
}

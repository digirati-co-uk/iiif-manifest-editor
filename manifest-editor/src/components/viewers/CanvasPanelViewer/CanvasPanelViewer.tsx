import { CanvasPanel, CanvasContext, useManifest, useVault } from "react-iiif-vault";
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
<<<<<<< HEAD
import { useLayoutState } from "../../../shell/Layout/Layout.context";
import { Annotations } from "./components/Annotations";
=======
import { MediaControls } from "./components/MediaControls";
>>>>>>> feature/storybook-ish

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
  const vault = useVault();
  const { rightPanel } = useLayoutState();
  const [refreshKey, refresh] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    runtime.current?.goHome();
  }, [state.canvasId]);

  if (manifest?.items.length === 0) {
    return <EmptyCanvasState />;
  }

<<<<<<< HEAD
  if (!state.canvasId) {
=======
  if (!canvas || !manifest) {
>>>>>>> feature/storybook-ish
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
      resetKeys={[state.canvasId, refreshKey]}
      fallbackRender={() => (
        <CanvasContainer>
          <GhostCanvas>Something went wrong</GhostCanvas>
        </CanvasContainer>
      )}
    >
      <Container key={refreshKey}>
        <style>{`
        .atlas-container {
          min-width: 0;
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  #f9f9f9;
        }
      `}</style>
        <ViewerContainer>
<<<<<<< HEAD
          <CanvasPanel.Viewer key={state.canvasId} onCreated={(preset) => void (runtime.current = preset.runtime)}>
            <CanvasContext canvas={state.canvasId}>
              <CanvasPanel.RenderCanvas />
=======
          <CanvasPanel.Viewer key={canvas} onCreated={(preset) => void (runtime.current = preset.runtime)}>
            <CanvasContext canvas={canvas}>
              <CanvasPanel.RenderCanvas
                strategies={["images", "media"]}
                renderViewerControls={() => <ViewControls refresh={refresh} />}
                renderMediaControls={() => <MediaControls />}
              />
>>>>>>> feature/storybook-ish
            </CanvasContext>
            {rightPanel.current === "canvas-properties" && rightPanel.state.current === 5 && (
              <Annotations canvasId={state.canvasId} />
            )}
          </CanvasPanel.Viewer>
        </ViewerContainer>
      </Container>
    </ErrorBoundary>
  );
}

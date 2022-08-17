import { CanvasPanel, CanvasContext, useManifest } from "react-iiif-vault";
import React, { useEffect, useReducer, useRef } from "react";
import { Runtime } from "@atlas-viewer/atlas";
import { ErrorBoundary } from "react-error-boundary";
import { useAppState } from "@/shell/AppContext/AppContext";
import { useLayoutState } from "@/shell/Layout/Layout.context";
import { CanvasContainer, GhostCanvas } from "@/components/layout/CanvasContainer";
import { EmptyCanvasState } from "@/components/organisms/EmptyCanvasState/EmptyCanvasState";
import { BlockIcon } from "@/icons/BlockIcon";
import { PaddingComponentMedium, PaddingComponentSmall } from "@/atoms/PaddingComponent";
import { Loading } from "@/atoms/Loading";
import { ViewControls } from "./components/ViewControls";
import { Annotations } from "./components/Annotations";
import { MediaControls } from "./components/MediaControls";
import * as S from "./CanvasPanelViewer.styles";

export function CanvasPanelViewer() {
  const { state } = useAppState();
  const runtime = useRef<Runtime>();
  const manifest = useManifest(); // @todo remove.
  const { rightPanel } = useLayoutState();
  const [refreshKey, refresh] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    runtime.current?.goHome();
  }, [state.canvasId]);

  if (!manifest) {
    return <Loading />;
  }

  if (!manifest || manifest?.items.length === 0) {
    return <EmptyCanvasState />;
  }

  if (!state.canvasId) {
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
      <S.Container key={refreshKey}>
        <style>{`
        .atlas-container {
          min-width: 0;
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  #f9f9f9;
        }
      `}</style>
        <S.ViewerContainer>
          <CanvasPanel.Viewer key={state.canvasId} onCreated={(preset) => void (runtime.current = preset.runtime)}>
            <CanvasContext canvas={state.canvasId}>
              <CanvasPanel.RenderCanvas
                strategies={["images", "media"]}
                renderViewerControls={() => <ViewControls refresh={refresh} />}
                renderMediaControls={() => <MediaControls />}
              />
            </CanvasContext>
            {rightPanel.current === "canvas-properties" && rightPanel.state.current === 5 && (
              <Annotations canvasId={state.canvasId} />
            )}
          </CanvasPanel.Viewer>
        </S.ViewerContainer>
      </S.Container>
    </ErrorBoundary>
  );
}

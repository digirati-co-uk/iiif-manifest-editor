import { CanvasPanel, CanvasContext, useManifest, useVault } from "react-iiif-vault";
import styled from "styled-components";
import { useAppState } from "../../../shell/AppContext/AppContext";
import React, { useEffect, useReducer, useRef } from "react";
import { ResizeWorldItem, Runtime } from "@atlas-viewer/atlas";
import { ViewControls } from "./components/ViewControls";
import { ErrorBoundary } from "react-error-boundary";
import { CanvasContainer, GhostCanvas } from "../../layout/CanvasContainer";
import { BlockIcon } from "../../../icons/BlockIcon";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../../atoms/PaddingComponent";
import { EmptyCanvasState } from "../../organisms/EmptyCanvasState/EmptyCanvasState";
import { useLayoutState } from "../../../shell/Layout/Layout.context";
import { EditAnnotations } from "../../../editors/EditAnnotations";
import { BoxSelector } from "../../../madoc/components/BoxSelector";
import BoxSelectorAtlas, { RegionHighlight } from "../../../madoc/components/BoxSelector.Atlas";

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

  const goHome = () => runtime.current?.world.goHome();
  const zoomIn = () => runtime.current?.world.zoomTo(0.75);
  const zoomOut = () => runtime.current?.world.zoomTo(1 / 0.75);

  useEffect(() => {
    runtime.current?.goHome();
  }, [state.canvasId]);

  if (manifest?.items.length === 0) {
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
      <Container key={refreshKey}>
        <ViewControls goHome={goHome} zoomIn={zoomIn} zoomOut={zoomOut} refresh={refresh} />
        <style>{`
        .atlas-container {
          min-width: 0;
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  #f9f9f9;
        }
        .annotation {
          background: rgba(50, 0, 200, 0.4);
        }
      `}</style>
        <ViewerContainer>
          <CanvasPanel.Viewer key={state.canvasId} onCreated={(preset) => void (runtime.current = preset.runtime)}>
            <CanvasContext canvas={state.canvasId}>
              <CanvasPanel.RenderCanvas />
            </CanvasContext>
            {rightPanel.current === "canvas-properties" &&
              rightPanel.state.current === 5 &&
              vault &&
              state.canvasId &&
              // @ts-ignore
              vault.get(state.canvasId).annotations.map((annoPage) => {
                const annotationPage = vault.get(annoPage) as any;
                return annotationPage.items.map((item: any, index: number) => {
                  const annotation = vault.get(item) as any;
                  const target = annotation.target.split("#xywh=")[1];
                  const split = target.split(",").map((position: string) => parseInt(position));
                  return (
                    <ResizeWorldItem
                      id={item.id}
                      // type={"box-selector"}
                      x={0}
                      y={0}
                      width={1000}
                      height={2000}
                      resizable={true}
                      // onSave={(saveCallback)}
                      // style={{ background: "rgba(50, 0, 200, 0.4)" }}
                      // isEditing={false}
                      onSave={() => {}}
                      // onClick={() => {}}
                    >
                      <box
                        interactive
                        html
                        id={`${item.id}/box`}
                        relativeStyle
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // onClick(region);
                          console.table(e);
                        }}
                        style={{ background: "rgba(50, 0, 200, 0.2)" }}
                        target={{ x: split[0], y: split[1], width: split[2], height: split[3] }}
                      />
                    </ResizeWorldItem>
                  );
                });
              })}
          </CanvasPanel.Viewer>
        </ViewerContainer>
      </Container>
    </ErrorBoundary>
  );
}

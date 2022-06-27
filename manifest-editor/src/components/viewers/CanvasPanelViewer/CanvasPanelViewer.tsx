import { CanvasPanel, CanvasContext, useManifest, useVault } from "react-iiif-vault";
import styled from "styled-components";
import { useAppState } from "../../../shell/AppContext/AppContext";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { DrawBox, ResizeWorldItem, Runtime, useControlledAnnotationList } from "@atlas-viewer/atlas";
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
import { AnnotationPage } from "./components/Annotations";

type FormattedAnnotation = {
  id: string;
  height: number;
  width: number;
  x: number;
  y: number;
};

function getAnnotationTarget(annotation: any) {
  // console.log(annotation);
  const split = annotation.target.split("#xywh=")[1].split(",");
  // console.log(split);
  return {
    id: annotation.id,
    height: parseInt(split[0]),
    width: parseInt(split[1]),
    x: parseInt(split[2]),
    y: parseInt(split[3]),
  };
}

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

  const [annotationList, setAnnotationsList] = useState<any[]>([]);
  const [formattedAnnotationList, setFormattedAnnotationList] = useState<FormattedAnnotation[]>([]);

  useEffect(() => {
    runtime.current?.goHome();

    const canvas = vault.get(state.canvasId) as any;
    const annos: any[] = [];
    if (canvas) {
      canvas.annotations.map((annoPage: any) => {
        console.log(annoPage);
        const annotations = vault.get(annoPage) as any;
        console.log(annotations);
        annotations.items.map((anno: any) => annos.push(vault.get(anno)));
      });
    }
    setAnnotationsList(annos);
  }, [state.canvasId]);

  useEffect(() => {
    const annos: any[] = annotationList.map((anno: any) => getAnnotationTarget(anno)) as FormattedAnnotation[];
    setFormattedAnnotationList(annos);
  }, [annotationList]);
  console.log(formattedAnnotationList);
  // const {
  //   isEditing,
  //   onDeselect,
  //   selectedAnnotation,
  //   onCreateNewAnnotation,
  //   annotations,
  //   onUpdateAnnotation,
  //   setIsEditing,
  //   setSelectedAnnotation,
  //   editAnnotation,
  //   addNewAnnotation,
  // } = useControlledAnnotationList(formattedAnnotationList);

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
            {/* {rightPanel.current === "canvas-properties" &&
            rightPanel.state.current === 5 &&
            isEditing &&
            !selectedAnnotation ? (
              <DrawBox onCreate={onCreateNewAnnotation} />
            ) : null} */}
            {/* {console.log(annotations)} */}
            {rightPanel.current === "canvas-properties" &&
              rightPanel.state.current === 5 &&
              formattedAnnotationList.map((annotation) => {
                return (
                  <ResizeWorldItem
                    x={annotation.x}
                    y={annotation.y}
                    width={annotation.width}
                    height={annotation.height}
                    resizable={true}
                    onSave={() => {}}
                  >
                    <box
                      interactive={true}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // onClick(region);
                      }}
                      target={{ x: 0, y: 0, width: annotation.width, height: annotation.height }}
                      backgroundColor={"rgba(0, 0, 0, 0.4"}
                    />
                  </ResizeWorldItem>
                );
              })}
          </CanvasPanel.Viewer>
        </ViewerContainer>
      </Container>
    </ErrorBoundary>
  );
}

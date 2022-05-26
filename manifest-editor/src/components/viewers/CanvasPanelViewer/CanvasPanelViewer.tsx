import { CanvasPanel, CanvasContext, useCanvas } from "react-iiif-vault";
import styled from "styled-components";
import { useAppState } from "../../../shell/AppContext/AppContext";
import { useEffect, useRef } from "react";
import { Runtime } from "@atlas-viewer/atlas";
import { ViewControls } from "./components/ViewControls";

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
  const _canvas = useCanvas(); // @todo remove.
  const canvas = state?.canvasId || _canvas?.id;

  console.log("state", state);

  const goHome = () => runtime.current?.world.goHome();
  const zoomIn = () => runtime.current?.world.zoomTo(0.75);
  const zoomOut = () => runtime.current?.world.zoomTo(1 / 0.75);

  useEffect(() => {
    runtime.current?.goHome();
  }, [canvas]);

  if (!canvas) {
    return <div>No canvas</div>;
  }

  return (
    <Container>
      <ViewControls goHome={goHome} zoomIn={zoomIn} zoomOut={zoomOut} />
      <style>{`
        .atlas-container {
          min-width: 0;
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  #f9f9f9;
        }
      `}</style>
      <ViewerContainer>
        <CanvasPanel.Viewer key={canvas} onCreated={(preset) => void (runtime.current = preset.runtime)}>
          <CanvasContext canvas={canvas}>
            <CanvasPanel.RenderCanvas />
          </CanvasContext>
        </CanvasPanel.Viewer>
      </ViewerContainer>
    </Container>
  );
}
import { useRef } from "react";
import { useManifest } from "react-iiif-vault";
import styled from "styled-components";
import { useAppState } from "../../../shell/AppContext/AppContext";

const Container = styled.div`
  width: 100%;
  min-width: 20px;
`;
export function AnnotationPreview({ region }: { region: string }) {
  const { state } = useAppState();
  const viewer = useRef();
  const manifest = useManifest();

  return (
    <Container>
      <style>{`
         .atlas-container {
          min-width: 0;
          min-height: 0;
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  #E5E7F0;
        }
          canvas-panel {
            display: flex;
            flex-direction: column;
            min-width: 0;

            --atlas-container-flex: 1 1 0px;
            --atlas-background:  #E5E7F0;
          }
      `}</style>

      <canvas-panel
        ref={viewer}
        manifest-id={manifest?.id}
        canvas-id={state.canvasId}
        region={region}
        render="static"
      />
    </Container>
  );
}

import React, { useRef, useEffect } from "react";
import { useCanvas } from "@hyperion-framework/react-vault";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../atoms/ModalBackground";
import { ModalContainer } from "../atoms/ModalContainer";
import { CanvasContainer } from "../atoms/CanvasContainer";
import { UniversalViewer } from "../previewers/UniversalViewerLazy";

export const PreviewView: React.FC<{ manifest: any; close: any }> = ({
  manifest,
  close
}) => {
  const viewer = useRef();
  const canvas = useCanvas();
  console.log(canvas);

  // required for next js ssr
  useEffect(() => {
    import("@digirati/canvas-panel-web-components");
  }, []);

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <Button onClick={close}>
          <CloseIcon />
        </Button>
        <CanvasContainer>
          {/* WE ACTUALLY NEED TO GIVE IT THE VAULT MANIFEST HERE INSTEAD BUT WE DON"T HAVE A PERSISTED URL YET*/}
          <UniversalViewer manifestId={manifest.manifest}
          canvasIndex={2}
          />
        </CanvasContainer>
      </ModalContainer>
    </>
  );
};

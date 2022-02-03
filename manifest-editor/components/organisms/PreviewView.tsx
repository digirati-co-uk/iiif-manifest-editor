import React, { useRef, useEffect } from "react";
import { useCanvas } from "@hyperion-framework/react-vault";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../atoms/ModalBackground";
import { ModalContainer } from "../atoms/ModalContainer";
import { CanvasContainer } from "../atoms/CanvasContainer";
import UniversalViewer from "../previewers/UniversalViewer";

export const PreviewView: React.FC<{ manifest: any; close: any }> = ({
  manifest,
  close
}) => {
  const viewer = useRef();
  const canvas = useCanvas();
  console.log(manifest.manifest);

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
          {/* WE ACTUALLY NEED TO GIVE IT THE VAULT MANIFEST HERE INSTEAD */}
          <UniversalViewer manifestId={manifest.manifest}

          />
        </CanvasContainer>
      </ModalContainer>
    </>
  );
};

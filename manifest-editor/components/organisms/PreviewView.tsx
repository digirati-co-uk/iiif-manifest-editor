import React, { useEffect } from "react";
import { useManifest } from "@hyperion-framework/react-vault";
import { CanvasContainer } from "../layout/CanvasContainer";
import { UniversalViewer } from "../previewers/UniversalViewerLazy";

export const PreviewView: React.FC = () => {
  const manifest = useManifest();
  console.log(manifest);

  // required for next js ssr
  useEffect(() => {
    import("@digirati/canvas-panel-web-components");
  }, []);

  return (
    <>
      <CanvasContainer>
        {/* WE ACTUALLY NEED TO GIVE IT THE VAULT MANIFEST HERE INSTEAD BUT WE DON"T HAVE A PERSISTED URL YET*/}
        {manifest ? (
          <UniversalViewer manifestId={manifest.id ? manifest.id : ""} />
        ) : (
          <></>
        )}
      </CanvasContainer>
    </>
  );
};

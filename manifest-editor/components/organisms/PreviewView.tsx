import React, { useEffect } from "react";
import { useManifest } from "react-iiif-vault";
import { CanvasContainer } from "../layout/CanvasContainer";
import { UniversalViewer } from "../previewers/UniversalViewerLazy";

export const PreviewView: React.FC = () => {
  const manifest = useManifest();

  // required for next js ssr
  useEffect(() => {
    import("@digirati/canvas-panel-web-components");
  }, []);

  return (
    <>
      <CanvasContainer>
        {manifest ? (
          <UniversalViewer manifestId={manifest.id ? manifest.id : ""} />
        ) : (
          <></>
        )}
      </CanvasContainer>
    </>
  );
};

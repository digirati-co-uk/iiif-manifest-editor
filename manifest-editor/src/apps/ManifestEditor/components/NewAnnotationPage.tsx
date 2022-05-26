import { useLayoutActions } from "../../../shell/Layout/Layout.context";
import { useCanvas, useVault } from "react-iiif-vault";
import { useManifest } from "../../../hooks/useManifest";
import { MediaBody } from "../../../types/media-body";
import { v4 } from "uuid";
import { IIIFBuilder } from "iiif-builder";
import { NewMediaForm } from "../../../editors/MediaProperties/NewMediaForm";
import { useAppState } from "../../../shell/AppContext/AppContext";
import { PaddedSidebarContainer } from "../../../atoms/PaddedSidebarContainer";

export function NewAnnotationPage() {
  const { open } = useLayoutActions();
  const { state } = useAppState();
  const manifest = useManifest();
  const vault = useVault();
  const canvasId = state.canvasId;

  const addNew = (body: MediaBody) => {
    const newID = `vault://${v4()}`;
    if (!canvasId || !manifest) {
      return;
    }
    const builder = new IIIFBuilder(vault);
    builder.editManifest(manifest.id, (mani) => {
      mani.editCanvas(canvasId, (can) => {
        can.createAnnotation(newID, {
          id: `${newID}/painting`,
          type: "Annotation",
          motivation: "painting",
          body: body as any,
        });
      });
    });
    open("canvas-properties", { current: 2 });
  };

  return (
    <PaddedSidebarContainer>
      <NewMediaForm addNew={addNew} close={() => open("canvas-properties", { current: 2 })} />
    </PaddedSidebarContainer>
  );
}

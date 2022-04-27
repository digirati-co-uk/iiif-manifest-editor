import { useContext } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import { useContentResource } from "../../../hooks/useContentResource";
import { useManifest } from "../../../hooks/useManifest";
import { IIIFBuilder } from "iiif-builder";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import { MediaBody } from "../../../types/media-body";
import ShellContext from "../../apps/Shell/ShellContext";
import { NewMediaForm } from "./NewMediaForm";
import { EditMediaForm } from "./EditMediaForm";
var uuid = require("uuid");

export const MediaForm = () => {
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const manifest = useManifest();
  const vault = useVault();

  const addNew = (body: MediaBody) => {
    const newID = `vault://${uuid.v4()}`;
    if (!canvas || !manifest) return;
    const builder = new IIIFBuilder(vault);
    builder.editManifest(manifest.id, (mani: any) => {
      mani.editCanvas(canvas.id, (can: any) => {
        can.createAnnotation(canvas.id, {
          id: `${newID}/painting`,
          type: "Annotation",
          motivation: "painting",
          body: body,
        });
      });
    });
    shellContext?.setUnsavedChanges(true);
  };
  if (editorContext?.selectedPanel === -1)
    return (
      <NewMediaForm
        addNew={addNew}
        close={() => editorContext?.changeSelectedProperty("canvas", 2)}
      />
    );
  return <EditMediaForm />;
};

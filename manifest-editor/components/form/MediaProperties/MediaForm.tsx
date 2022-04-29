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
// import { importEntities } from "@iiif/vault/actions";
var uuid = require("uuid");

export const MediaForm = () => {
  const editorContext = useContext(ManifestEditorContext);
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const manifest = useManifest();
  const vault = useVault();

  const addNew = (body: MediaBody) => {
    console.log(body);
    const newID = `vault://${uuid.v4()}`;
    if (!canvas || !manifest) return;
    const builder = new IIIFBuilder(vault);
    builder.editManifest(manifest.id, (mani: any) => {
      mani.editCanvas(canvas.id, (can: any) => {
        can.createAnnotation(newID, {
          id: `${newID}/painting`,
          type: "Annotation",
          motivation: "painting",
          body: body,
        });
      });
    });
    shellContext?.setUnsavedChanges(true);
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = canvas ? [...canvas.items] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "items", newOrder);
    }
  };

  const remove = (index: number) => {
    const copy = canvas && canvas.items ? [...canvas.items] : [];
    if (canvas && (index || index === 0)) {
      copy.splice(index, 1);
      shellContext?.setUnsavedChanges(true);
      // Provide the vault with an updated list of content resources
      // with the item removed
      vault.modifyEntityField(canvas, "items", copy);
    }
  };

  const edit = (body: MediaBody) => {
    const index = editorContext?.selectedPanel;

    if (!canvas || !manifest) return;
    if (typeof index === "undefined") return;
    // Add a new annotation
    addNew(body);
    // Reorder the annotations, so new one is in the index that we wanted to replace
    reorder(canvas.items.length, index);
    // Remove the last one which should now be the one we wanted to replace.
    remove(canvas.items.length);
    shellContext?.setUnsavedChanges(true);
    editorContext?.changeSelectedProperty("canvas", 2);
  };

  if (editorContext?.selectedPanel === -1)
    return (
      <NewMediaForm
        addNew={(body: MediaBody) => {
          addNew(body);
          editorContext?.changeSelectedProperty("canvas", 2);
        }}
        close={() => editorContext?.changeSelectedProperty("canvas", 2)}
      />
    );

  if (!vault || !canvas) return <></>;
  if (typeof editorContext?.selectedPanel === "undefined") return <></>;

  const prevItem = vault.get(canvas.items)[editorContext?.selectedPanel] as any;
  const prevAnnotation = vault.get(prevItem.items[0].id) as any;
  const prevBody = vault.get(prevAnnotation.body[0].id) as any;
  return (
    <EditMediaForm
      edit={edit}
      close={() => editorContext?.changeSelectedProperty("canvas", 2)}
      prevHeight={prevBody.height || 0}
      prevWidth={prevBody.width || 0}
      prevDuration={0}
      prevSrc={prevBody.id || ""}
      prevType={prevBody.type || ""}
      prevFormat={prevBody.format || ""}
    />
  );
};

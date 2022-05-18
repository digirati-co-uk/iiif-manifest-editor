import { useContext } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { useShell } from "../../context/ShellContext/ShellContext";
import { NewMediaForm } from "./NewMediaForm";
import { EditMediaForm } from "./EditMediaForm";
import { addMapping, importEntities } from "@iiif/vault/actions";
import { v4 } from "uuid";
import { MediaBody } from "../../types/media-body";

export const CanvasThumbnailForm = () => {
  const editorContext = useManifestEditor();
  const shellContext = useShell();
  const canvas = useCanvas();
  const manifest = useManifest();
  const vault = useVault();

  const addNew = (body: MediaBody) => {
    const index = editorContext?.selectedPanel || canvas?.thumbnail.length || 0;
    // Add new ref to the vault
    vault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [body.id]: {
              id: body.id,
              type: "Image",
            },
          },
        },
      })
    );
    // Add the mapping in
    vault.dispatch(
      addMapping({
        id: body.id,
        type: "ContentResource",
      })
    );
    // Tell the vault to update which references are associated with the parent property
    const newThumbnailReferences = canvas && canvas.thumbnail ? [...canvas.thumbnail] : [];
    if (canvas) {
      newThumbnailReferences.push({ id: body.id, type: "ContentResource" });
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "thumbnail", newThumbnailReferences);
    }
    // get the ref we need using the index:
    const reference = canvas?.thumbnail[-1];
    // dispatch a change to this reference
    shellContext.setUnsavedChanges(true);
    if (reference) {
      vault.modifyEntityField(reference, "width", body.width);
      vault.modifyEntityField(reference, "height", body.height);
      vault.modifyEntityField(reference, "format", body.format);
      vault.modifyEntityField(reference, "type", body.type);
    }
    shellContext.setUnsavedChanges(true);
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = canvas ? [...canvas.thumbnail] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (canvas) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "thumbnail", newOrder);
    }
  };

  const remove = (index: number) => {
    const copy = canvas && canvas.thumbnail ? [...canvas.thumbnail] : [];
    if (canvas && (index || index === 0)) {
      copy.splice(index, 1);
      shellContext.setUnsavedChanges(true);
      // Provide the vault with an updated list of content resources
      // with the item removed
      vault.modifyEntityField(canvas, "thumbnail", copy);
    }
  };

  const edit = (body: MediaBody) => {
    const index = editorContext?.selectedPanel;

    if (!canvas || !manifest) {
      return;
    }
    if (typeof index === "undefined") {
      return;
    }
    // Add a new annotation
    addNew(body);
    // Reorder the annotations, so new one is in the index that we wanted to replace
    reorder(canvas.thumbnail.length, index);
    // Remove the last one which should now be the one we wanted to replace.
    remove(canvas.thumbnail.length);
    shellContext.setUnsavedChanges(true);
    editorContext?.changeSelectedProperty("canvas", 2);
  };

  if (editorContext?.selectedPanel === -1) {
    return (
      <NewMediaForm
        addNew={(body: MediaBody) => {
          addNew(body);
          editorContext?.changeSelectedProperty("canvas", 2);
        }}
        close={() => editorContext?.changeSelectedProperty("canvas", 2)}
      />
    );
  }

  if (!vault || !canvas) {
    return <></>;
  }
  if (typeof editorContext?.selectedPanel === "undefined") {
    return <></>;
  }

  const prevThumbnail = vault.get(canvas.thumbnail)[editorContext?.selectedPanel] as any;

  return (
    <EditMediaForm
      edit={edit}
      close={() => editorContext?.changeSelectedProperty("canvas", 2)}
      prevHeight={prevThumbnail.height || 0}
      prevWidth={prevThumbnail.width || 0}
      prevDuration={0}
      prevSrc={prevThumbnail.id || ""}
      prevType={prevThumbnail.type || ""}
      prevFormat={prevThumbnail.format || ""}
    />
  );
};

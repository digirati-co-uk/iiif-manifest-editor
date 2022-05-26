import { useVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { NewMediaForm } from "./NewMediaForm";
import { EditMediaForm } from "./EditMediaForm";
import { addMapping, importEntities } from "@iiif/vault/actions";
import { MediaBody } from "../../types/media-body";

export const ManifestThumbnailForm = () => {
  const editorContext = useManifestEditor();
  const manifest = useManifest();
  const vault = useVault();

  const addNew = (body: MediaBody) => {
    const index = editorContext?.selectedPanel || manifest?.thumbnail.length || 0;
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
    const newThumbnailReferences = manifest && manifest.thumbnail ? [...manifest.thumbnail] : [];
    if (manifest) {
      newThumbnailReferences.push({ id: body.id, type: "ContentResource" });

      vault.modifyEntityField(manifest, "thumbnail", newThumbnailReferences);
    }
    // get the ref we need using the index:
    const reference = manifest?.thumbnail[-1];
    // dispatch a change to this reference

    if (reference) {
      vault.modifyEntityField(reference, "width", body.width);
      vault.modifyEntityField(reference, "height", body.height);
      vault.modifyEntityField(reference, "format", body.format);
      vault.modifyEntityField(reference, "type", body.type);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = manifest ? [...manifest.thumbnail] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (manifest) {
      vault.modifyEntityField(manifest, "thumbnail", newOrder);
    }
  };

  const remove = (index: number) => {
    const copy = manifest && manifest.thumbnail ? [...manifest.thumbnail] : [];
    if (manifest && (index || index === 0)) {
      copy.splice(index, 1);

      // Provide the vault with an updated list of content resources
      // with the item removed
      vault.modifyEntityField(manifest, "thumbnail", copy);
    }
  };

  const edit = (body: MediaBody) => {
    const index = editorContext?.selectedPanel;

    if (!manifest || !manifest) {
      return;
    }
    if (typeof index === "undefined") {
      return;
    }
    // Add a new annotation
    addNew(body);
    // Reorder the annotations, so new one is in the index that we wanted to replace
    reorder(manifest.thumbnail.length, index);
    // Remove the last one which should now be the one we wanted to replace.
    remove(manifest.thumbnail.length);

    editorContext?.changeSelectedProperty("manifest", 2);
  };

  if (editorContext?.selectedPanel === -1) {
    return (
      <NewMediaForm
        addNew={(body: MediaBody) => {
          addNew(body);
          editorContext?.changeSelectedProperty("manifest", 0);
        }}
        close={() => editorContext?.changeSelectedProperty("manifest", 0)}
      />
    );
  }

  if (!vault || !manifest) {
    return <></>;
  }
  if (typeof editorContext?.selectedPanel === "undefined") {
    return <></>;
  }

  const prevThumbnail = vault.get(manifest.thumbnail)[editorContext?.selectedPanel] as any;

  return (
    <EditMediaForm
      edit={edit}
      close={() => editorContext?.changeSelectedProperty("manifest", 2)}
      prevHeight={prevThumbnail.height || 0}
      prevWidth={prevThumbnail.width || 0}
      prevDuration={0}
      prevSrc={prevThumbnail.id || ""}
      prevType={prevThumbnail.type || ""}
      prevFormat={prevThumbnail.format || ""}
    />
  );
};

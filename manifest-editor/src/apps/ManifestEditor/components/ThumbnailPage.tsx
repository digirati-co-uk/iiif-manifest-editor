import { useLayoutActions } from "../../../shell/Layout/Layout.context";
import { useCanvas, useVault } from "react-iiif-vault";
import { useManifest } from "../../../hooks/useManifest";
import { MediaBody } from "../../../types/media-body";
import { NewMediaForm } from "../../../editors/MediaProperties/NewMediaForm";
import { useAppState } from "../../../shell/AppContext/AppContext";
import { PaddedSidebarContainer } from "../../../atoms/PaddedSidebarContainer";
import { addMapping, importEntities } from "@iiif/vault/actions";
import { useVaultSelector } from "../../../hooks/useVaultSelector";

export function ThumbnailPage({ level }: { level: "manifest" | "canvas" }) {
  const { open } = useLayoutActions();
  const { state } = useAppState();
  const manifest = useManifest();
  const vault = useVault();
  const canvasId = state.canvasId;
  const canvas = manifest?.items.find((item) => item.id === canvasId);

  const addNew = (body: MediaBody) => {
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
    if (level === "manifest") {
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
      open("manifest-properties", { current: 0 });
    } else if (level === "canvas" && canvas) {
      const canvasProps = vault.get(canvas) as any;
      // Tell the vault to update which references are associated with the parent property
      const newThumbnailReferences = canvasProps && canvasProps.thumbnail ? [...canvasProps.thumbnail] : [];
      newThumbnailReferences.push({ id: body.id, type: "ContentResource" });
      vault.modifyEntityField(canvas, "thumbnail", newThumbnailReferences);
      // get the ref we need using the index:
      const reference = canvasProps?.thumbnail[-1];
      // dispatch a change to this reference

      if (reference) {
        vault.modifyEntityField(reference, "width", body.width);
        vault.modifyEntityField(reference, "height", body.height);
        vault.modifyEntityField(reference, "format", body.format);
        vault.modifyEntityField(reference, "type", body.type);
      }
      open("canvas-properties", { current: 0 });
    }
  };

  return (
    <PaddedSidebarContainer>
      <NewMediaForm
        addNew={addNew}
        close={() => open(level === "canvas" ? "canvas-properties" : "manifest-properties", { current: 0 })}
      />
    </PaddedSidebarContainer>
  );
}

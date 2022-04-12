import { useContext } from "react";
import { useVault } from "react-iiif-vault";
import { useManifest } from "../../../hooks/useManifest";
import ShellContext from "../../apps/Shell/ShellContext";
import { InformationLink } from "../../atoms/InformationLink";
import { InputLabel } from "../Input";
import { MediaResourceEditor } from "../MediaResourceEditor";

export const ThumbnailForm = () => {
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();
  const thumbnail =
    (manifest && manifest.thumbnail && vault.get(manifest.thumbnail)) ||
    ([] as any);

  return (
    <>
      <InputLabel>Thumbnail</InputLabel>
      {thumbnail &&
        manifest &&
        thumbnail.map((thumb: any) => {
          return (
            <div
              style={{ border: "1px solid black", borderRadius: "5px" }}
              key={thumb.id}
            >
              <MediaResourceEditor
                thumbnailSrc={thumb?.id}
                changeThumbnailSrc={(newID: string) => {
                  shellContext?.setUnsavedChanges(true);
                  vault.modifyEntityField(thumb, "id", newID);
                }}
                changeHeight={(newHeight: Number) => {
                  shellContext?.setUnsavedChanges(true);
                  vault.modifyEntityField(thumb, "height", newHeight);
                }}
                changeWidth={(newWidth: Number) => {
                  shellContext?.setUnsavedChanges(true);
                  vault.modifyEntityField(thumb, "width", newWidth);
                }}
                height={thumb.height}
                width={thumb.width}
                type={thumb.type}
                changeType={(newType: string) => {
                  shellContext?.setUnsavedChanges(true);
                  vault.modifyEntityField(thumb, "width", newType);
                }}
                serviceID={thumb.service}
              />
              <InformationLink
                guidanceReference={
                  "https://iiif.io/api/presentation/3.0/#thumbnail"
                }
              />
            </div>
          );
        })}
    </>
  );
};

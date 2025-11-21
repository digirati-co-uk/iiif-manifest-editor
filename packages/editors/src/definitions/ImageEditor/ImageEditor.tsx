import { toRef } from "@iiif/parser";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditingResource, useEditor } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { ThumbnailImg } from "@manifest-editor/ui/atoms/Thumbnail";
import { ThumbnailContainer } from "@manifest-editor/ui/atoms/ThumbnailContainer";
import { useManifest, useVault } from "react-iiif-vault";
import { DimensionsTriplet } from "../../components/DimensionsTriplet";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { useContentResourceThumbnail } from "../../hooks/useContentResourceThumbnailHelper";

export function ImageEditor() {
  const resource = useEditingResource();
  const { technical } = useEditor();
  const vault = useVault();
  const { id, width, height, format } = technical;
  const manifest = useManifest();
  const thumbnail = useContentResourceThumbnail({ resourceId: id.get() });

  const isSame = manifest && toRef(manifest.thumbnail[0])?.id === toRef(resource?.resource)?.id;

  return (
    <>
      {thumbnail ? (
        <ThumbnailContainer $size={200}>
          <ThumbnailImg src={thumbnail.id} alt="thumbnail" />
        </ThumbnailContainer>
      ) : null}
      <PaddedSidebarContainer>
        <InputContainer $wide>
          <InputLabel htmlFor={id.focusId()}>Identifier</InputLabel>
          <Input disabled id={id.focusId()} value={id.get()} />
        </InputContainer>

        <InputContainer $wide>
          <DimensionsTriplet
            width={width.get() || 0}
            changeWidth={(v) => width.set(v)}
            height={height.get() || 0}
            changeHeight={(v) => height.set(v)}
          />
        </InputContainer>

        <InputContainer $wide>
          <InputLabel htmlFor={format.focusId()}>Format</InputLabel>
          <Input
            id={format.focusId()}
            value={format.get()}
            placeholder={"jpg, png etc."}
            onChange={(e: any) => format.set(e.target.value)}
          />
        </InputContainer>

        {manifest && resource?.parent?.type === "Canvas" ? (
          <Button
            disabled={isSame}
            onClick={() => {
              if (manifest) {
                vault.modifyEntityField(manifest, "thumbnail", [toRef(resource.resource)]);
              }
            }}
          >
            Set as Manifest thumbnail
          </Button>
        ) : null}
      </PaddedSidebarContainer>
    </>
  );
}

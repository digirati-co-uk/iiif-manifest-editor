import { useCanvas, useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ThumbnailImg } from "../../atoms/Thumbnail";
import { ThumbnailContainer } from "../../atoms/ThumbnailContainer";
import { Input, InputLabel } from "../Input";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";

interface MediaResourceEditorProps {
  thumbnailSrc: string;
}

export const MediaResourcePreview: React.FC<MediaResourceEditorProps> = ({
  thumbnailSrc,
}) => {
  const vault = useVault();
  const canvas = useCanvas();
  const image = vault.get(thumbnailSrc) as any;
  console.log(image);
  return (
    <>
      {image &&
        image?.body &&
        Array.isArray(image.body) &&
        image.body.map((annotationBody: any) => {
          const body = vault.get(annotationBody.id) as any;
          return (
            <FlexContainer
              style={{
                alignItems: "center",
                width: "100%",
              }}
              key={thumbnailSrc}
            >
              <FlexContainerColumn>
                {thumbnailSrc && thumbnailSrc !== "" && (
                  <ThumbnailContainer size={32}>
                    <ThumbnailImg src={annotationBody.id} alt="thumbnail" />
                  </ThumbnailContainer>
                )}
              </FlexContainerColumn>
              <div style={{ padding: "10px" }}>{body.type}</div>
            </FlexContainer>
          );
        })}
    </>
  );
};

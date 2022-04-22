import { useCanvas, useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ThumbnailImg } from "../../atoms/Thumbnail";
import { ThumbnailContainer } from "../../atoms/ThumbnailContainer";
import { InputLabel } from "../Input";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";

interface MediaResourceEditorProps {
  thumbnailSrc: string;
}

export const MediaResourcePreview: React.FC<MediaResourceEditorProps> = ({
  thumbnailSrc,
}) => {
  const vault = useVault();
  const canvas = useCanvas();
  const image = vault.get(thumbnailSrc);
  return (
    <>
      {
        // @ts-ignore
        image.body.map((annotationBody: any) => {
          console.log(annotationBody);
          return (
            <FlexContainer
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
              key={thumbnailSrc}
            >
              <FlexContainerColumn style={{ width: "20%" }}>
                {thumbnailSrc && thumbnailSrc !== "" && (
                  <ThumbnailContainer size={128}>
                    <ThumbnailImg src={annotationBody.id} alt="thumbnail" />
                  </ThumbnailContainer>
                )}
              </FlexContainerColumn>
              <FlexContainerColumn style={{ width: "80%" }}>
                <ErrorBoundary>
                  <InputLabel>
                    id: <div>{annotationBody.id}</div>
                  </InputLabel>
                  <InputLabel>
                    target:
                    <div>
                      {
                        // @ts-ignore
                        canvas.id === image?.target
                          ? "Whole Canvas"
                          : // @ts-ignore
                            image?.canvas
                      }
                    </div>
                  </InputLabel>
                </ErrorBoundary>
                <FlexContainer></FlexContainer>
              </FlexContainerColumn>
            </FlexContainer>
          );
        })
      }
    </>
  );
};

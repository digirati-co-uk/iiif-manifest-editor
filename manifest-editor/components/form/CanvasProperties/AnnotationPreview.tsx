import { useCanvas, useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { ThumbnailImg } from "../../atoms/Thumbnail";
import { ThumbnailContainer } from "../../atoms/ThumbnailContainer";
import { InputLabel } from "../Input";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";

interface MediaResourceEditorProps {
  thumbnailSrc: string;
}

export const AnnotationPreview: React.FC<MediaResourceEditorProps> = ({
  thumbnailSrc,
}) => {
  const vault = useVault();
  const canvas = useCanvas();
  const image = vault.get(thumbnailSrc);
  console.log(image, thumbnailSrc);
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
              <FlexContainerColumn style={{ width: "100%" }}>
                <ErrorBoundary>
                  <InputLabel>
                    body:{" "}
                    <pre
                      // @ts-ignore
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                          vault.get(annotationBody.id),
                          null,
                          3
                        ),
                      }}
                    ></pre>
                  </InputLabel>

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

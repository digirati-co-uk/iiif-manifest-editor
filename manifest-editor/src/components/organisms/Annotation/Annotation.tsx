import { AnnotationContext, useCanvas, useVault } from "react-iiif-vault";
import { Button } from "../../../atoms/Button";
import { ErrorBoundary } from "../../../atoms/ErrorBoundary";
import { LightBox } from "../../../atoms/LightBox";
import { useAnnotationList } from "../../../hooks/useAnnotationsList";
import { useVaultSelector } from "../../../hooks/useVaultSelector";
import { CloseIcon } from "../../../icons/CloseIcon";
import { FlexContainer, FlexContainerColumn, FlexContainerRow } from "../../layout/FlexContainer";
import { AnnotationSnippet } from "./AnnotationSnippet";

interface AnnotationBodyProps {
  id: string;
  pageId: string;
}

export const AnnotationPreview: React.FC<AnnotationBodyProps> = ({ id, pageId }) => {
  const vault = useVault();
  const annotation = useVaultSelector((state) => state.iiif.entities.Annotation[id]);
  const canvas = useCanvas();
  const { removeAnnotation } = useAnnotationList(canvas?.id || "");

  if (!annotation) {
    return <>Annotation not found</>;
  }

  return (
    <LightBox>
      <FlexContainerRow justify="flex-end">
        <Button title="delete" onClick={() => removeAnnotation(id, pageId)}>
          <CloseIcon />
        </Button>
      </FlexContainerRow>
      {annotation.body.map((annotationBody: any) => {
        const annoBody = vault.get(annotationBody) as any;
        return (
          <FlexContainer
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
            key={id}
          >
            <FlexContainerColumn style={{ width: "100%" }}>
              <ErrorBoundary>
                <AnnotationContext annotation={id}>
                  <AnnotationSnippet
                    type={annoBody.type}
                    body={annoBody.value}
                    id={annotation.id}
                    target={annotation.target}
                  />
                </AnnotationContext>
              </ErrorBoundary>
            </FlexContainerColumn>
          </FlexContainer>
        );
      })}
    </LightBox>
  );
};

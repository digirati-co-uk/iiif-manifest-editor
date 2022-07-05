import { AnnotationContext, useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../../atoms/ErrorBoundary";
import { useAnnotation } from "../../../hooks/useAnnotation";
import { useVaultSelector } from "../../../hooks/useVaultSelector";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import { AnnotationSnippet } from "./AnnotationSnippet";

interface AnnotationBodyProps {
  id: string;
}

export const AnnotationPreview: React.FC<AnnotationBodyProps> = ({ id }) => {
  const vault = useVault();
  const annotation = useVaultSelector((state) => state.iiif.entities.Annotation[id]);

  console.log(id);
  console.log(annotation);

  if (!annotation) {
    return <>Annotation not found</>;
  }

  return (
    <>
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
                    onClick={(id: any) => console.log(id)}
                    target={annotation.target}
                  />
                </AnnotationContext>
              </ErrorBoundary>
            </FlexContainerColumn>
          </FlexContainer>
        );
      })}
    </>
  );
};

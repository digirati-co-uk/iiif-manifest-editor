import { useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../../atoms/ErrorBoundary";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import { AnnotationSnippet } from "./AnnotationSnippet";

interface AnnotationBodyProps {
  id: string;
}

export const AnnotationPreview: React.FC<AnnotationBodyProps> = ({ id }) => {
  const vault = useVault();
  const annotation = vault.get(id) as any;

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
                <AnnotationSnippet
                  type={annoBody.type}
                  body={annoBody.value}
                  id={annotation.id}
                  onClick={(id: any) => console.log(id)}
                  edit={() => {}}
                  target={annotation.target.id}
                />
              </ErrorBoundary>
            </FlexContainerColumn>
          </FlexContainer>
        );
      })}
    </>
  );
};

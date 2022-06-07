import { useCanvas, useVault } from "react-iiif-vault";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { Input, InputLabel, InputUnderlined } from "../Input";
import { FlexContainer, FlexContainerColumn } from "../../components/layout/FlexContainer";
import Textarea from "react-textarea-autosize";

interface AnnotationBodyProps {
  id: string;
}

export const AnnotationPreview: React.FC<AnnotationBodyProps> = ({ id }) => {
  const vault = useVault();
  const canvas = useCanvas();
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
                <InputLabel>{annotation.target.id}</InputLabel>
                <InputLabel>
                  <InputUnderlined
                    // id={annoBody.id}
                    onFocus={() => {}}
                    onChange={() => {
                      // DO SOMETHING
                    }}
                    onBlur={() => {
                      // DO SOMETHING
                    }}
                    as={Textarea}
                    value={annoBody.value}
                  />
                </InputLabel>
              </ErrorBoundary>
            </FlexContainerColumn>
          </FlexContainer>
        );
      })}
    </>
  );
};

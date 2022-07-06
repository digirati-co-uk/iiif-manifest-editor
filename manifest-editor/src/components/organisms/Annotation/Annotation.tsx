import { AnnotationContext, useAnnotation, useCanvas, useVault } from "react-iiif-vault";
import { Button } from "../../../atoms/Button";
import { ErrorBoundary } from "../../../atoms/ErrorBoundary";
import { LightBox } from "../../../atoms/LightBox";
import { InputLabel, InputUnderlined } from "../../../editors/Input";
import { useAnnotationList } from "../../../hooks/useAnnotationsList";
import { useVaultSelector } from "../../../hooks/useVaultSelector";
import { CloseIcon } from "../../../icons/CloseIcon";
import { FlexContainer, FlexContainerColumn, FlexContainerRow } from "../../layout/FlexContainer";
import { AnnotationBody } from "./AnnotationBody";
import { AnnotationPreview } from "./AnnotationPreview";
import { AnnotationSnippet } from "./AnnotationSnippet";
import { AnnotationTarget } from "./AnnotationTarget";

interface AnnotationProps {
  id: string;
  pageId: string;
}

export const Annotation: React.FC<AnnotationProps> = ({ id, pageId }) => {
  const vault = useVault();
  const annotation = useVaultSelector((state) => state.iiif.entities.Annotation[id]);
  const canvas = useCanvas();
  const { removeAnnotation } = useAnnotationList(canvas?.id || "");

  if (!annotation) {
    return <>Annotation not found</>;
  }

  return (
    <LightBox style={{ width: "100%" }}>
      <FlexContainerRow justify="flex-end">
        <Button title="delete" onClick={() => removeAnnotation(id, pageId)}>
          <CloseIcon />
        </Button>
      </FlexContainerRow>
      <FlexContainerColumn>
        <InputLabel>
          Identifier
          <InputUnderlined id={annotation.id} disabled value={annotation.id} />
        </InputLabel>
        <InputLabel>
          Motivation
          <InputUnderlined
            id={annotation.id}
            onChange={(e: any) =>
              vault.modifyEntityField({ id: annotation.id, type: "Annotation" }, "motivation", e.target.value)
            }
            value={annotation.motivation}
          />
        </InputLabel>
        <InputLabel>
          Body
          <LightBox style={{ width: "100%" }}>
            {annotation.body &&
              annotation.body.map((annotationBody: any) => {
                return <AnnotationBody annotationID={annotation.id} bodyID={annotationBody.id} />;
              })}
          </LightBox>
        </InputLabel>
        {console.log(annotation.target)}
        {annotation.target && typeof annotation.target === "string" ? (
          <AnnotationPreview region={annotation.target.split("#xywh=")[1]} />
        ) : (
          "No target specified"
        )}

        <AnnotationTarget canvasTarget={annotation.target} annotationID={annotation.id} />
      </FlexContainerColumn>
    </LightBox>
  );
};

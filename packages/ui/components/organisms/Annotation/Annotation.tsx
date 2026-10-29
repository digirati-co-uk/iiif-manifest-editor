import { useTranslations } from "@manifest-editor/i18n";
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
  const t = useTranslations("ui");
  const vault = useVault();
  const annotation = useVaultSelector((state) => state.iiif.entities.Annotation[id]);
  const canvas = useCanvas();
  const { removeAnnotation } = useAnnotationList(canvas?.id || "");

  if (!annotation) {
    return <>{t("annotation.notFound")}</>;
  }

  return (
    <LightBox style={{ width: "100%" }}>
      <FlexContainerRow justify="flex-end">
        <Button title={t("actions.delete")} onClick={() => removeAnnotation(id, pageId)}>
          <CloseIcon />
        </Button>
      </FlexContainerRow>
      <FlexContainerColumn>
        <InputLabel>
          {t("annotation.identifier")}
          <InputUnderlined id={annotation.id} disabled value={annotation.id} />
        </InputLabel>
        <InputLabel>
          {t("annotation.motivation")}
          <InputUnderlined
            id={annotation.id}
            onChange={(e: any) =>
              vault.modifyEntityField({ id: annotation.id, type: "Annotation" }, "motivation", e.target.value)
            }
            value={annotation.motivation}
          />
        </InputLabel>
        <InputLabel>
          {t("annotation.body")}
          <LightBox style={{ width: "100%" }}>
            {annotation.body &&
              annotation.body.map((annotationBody: any) => {
                return <AnnotationBody annotationID={annotation.id} bodyID={annotationBody.id} />;
              })}
          </LightBox>
        </InputLabel>
        {annotation.target && typeof annotation.target === "string" ? (
          <AnnotationPreview region={annotation.target.split("#xywh=")[1]} />
        ) : (
          t("annotation.noTarget")
        )}

        <AnnotationTarget canvasTarget={annotation.target} annotationID={annotation.id} />
      </FlexContainerColumn>
    </LightBox>
  );
};

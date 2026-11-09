import { useTranslations } from "@manifest-editor/i18n";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor, useLayoutActions } from "@manifest-editor/shell";
import { Button, ButtonGroup } from "@manifest-editor/ui/atoms/Button";
import { FlexImage } from "@manifest-editor/ui/components/layout/FlexContainer";
import { DeleteButton } from "@manifest-editor/ui/DeleteButton";
import { useCanvas, useVault } from "react-iiif-vault";
import { AnnotationPreview } from "../../components/AnnotationPreview/AnnotationPreview";
import { InputContainer, InputLabel } from "../../components/Input";
import { BoxSelectorField } from "../../form-elements/BoxSelectorField/BoxSelectorField";
import { centerRectangles } from "../../helpers/center-rectangles";
import { useAnnotationThumbnail } from "../../hooks/useAnnotationThumbnail";

export function FallbackAnnotationEditor() {
  const t = useTranslations("editors");
  // This is for an annotation
  const vault = useVault();
  const annotationEditor = useEditor();
  const { target } = annotationEditor.annotation;
  const canvasId = target.getSourceId();

  const { edit } = useLayoutActions();

  const thumbnail = useAnnotationThumbnail({ annotationId: annotationEditor.technical.id.get() });
  const canvas = useCanvas({ id: canvasId });

  const currentTarget = target.get();
  const currentSelector = target.getParsedSelector();

  const targetElements = (
    <>
      {canvas && !currentTarget.selector ? (
        <InputContainer $wide>
          <InputLabel $margin>{t("ui.target")}</InputLabel>
          <div style={{ border: "1px solid #ddd", borderRadius: 3, padding: "1em", color: "#999" }}>
            {t("ui.thisAnnotationFillsTheWholeCanvas")}
          </div>
          <ButtonGroup $right>
            <Button
              onClick={() => {
                vault.batch(() => {
                  const imagePosition = centerRectangles(
                    canvas,
                    {
                      width: 100,
                      height: 100,
                    },
                    0.6
                  );

                  target.setPosition(imagePosition);
                });
              }}
            >
              {t("ui.change")}
            </Button>
          </ButtonGroup>
        </InputContainer>
      ) : null}
      {currentSelector && currentSelector.type === "BoxSelector" ? (
        <InputContainer $wide>
          <BoxSelectorField
            selector={currentSelector}
            form
            inlineFieldset
            onSubmit={(data) => {
              target.setPosition(data.spatial);
            }}
          >
            <ButtonGroup $right>
              <Button type="button" onClick={() => target.removeSelector()}>
                {t("ui.targetWholeCanvas")}
              </Button>
              <Button type="submit">{t("ui.updateTarget")}</Button>
            </ButtonGroup>
          </BoxSelectorField>
        </InputContainer>
      ) : null}
    </>
  );

  return (
    <PaddedSidebarContainer>
      {targetElements}

      {annotationEditor.context ? (
        <DeleteButton
          label={t("ui.removeFromCanvas")}
          message={t("messages.removeFromCanvasConfirm")}
          onDelete={() => {
            annotationEditor.context?.removeFromParent();
            edit(annotationEditor.ref());
          }}
        >
          <FlexImage>{thumbnail ? <img src={thumbnail.id} /> : null}</FlexImage>
          <AnnotationPreview />
        </DeleteButton>
      ) : null}
    </PaddedSidebarContainer>
  );
}

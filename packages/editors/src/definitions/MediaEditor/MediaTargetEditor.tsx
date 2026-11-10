import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { useCustomContextMenu, useEditor } from "@manifest-editor/shell";
import {
  useAtlasStore,
  useCanvas,
  useCurrentAnnotationTransition,
  useRequestAnnotation,
  useVault,
} from "react-iiif-vault";
import { useStore } from "zustand";
import { InputContainer } from "../../components";
import { BoxSelectorField } from "../../form-elements/BoxSelectorField/BoxSelectorField";
import { ActionButton, CheckIcon } from "@manifest-editor/components";
import { targetWholeCanvas } from "./target-whole-canvas";

export function MediaTargetEditor() {
  const t = useTranslations("editors");
  const { locale, profile } = useEditorI18n();
  const vault = useVault();
  const annotationEditor = useEditor();
  const { target } = annotationEditor.annotation;
  const canvas = useCanvas({ id: target.getSourceId() });
  const bounds = canvas ? { x: 0, y: 0, width: canvas.width, height: canvas.height } : null;
  const { requestAnnotation, isPending, isActive, busy, completeRequest, cancelRequest, requestId } =
    useRequestAnnotation({
      onSuccess: (response) => {
        if (response.boundingBox) {
          target.setPosition(response.boundingBox);
        }
      },
    });
  const currentSelector = target.getParsedSelector();
  const setTargetWholeCanvas = () => targetWholeCanvas(vault, canvas, annotationEditor.annotation);

  useCustomContextMenu(
    {
      sectionTitle: t("messages.paintingAnnotationTarget"),
      resource: annotationEditor.ref(),
      items: [
        {
          id: "save-changes",
          label: t("ui.saveChanges"),
          enabled: isActive,
          onAction: () => {
            completeRequest();
          },
        },
        {
          id: "discard-changes",
          label: t("ui.discardChanges"),
          enabled: isActive,
          onAction: () => {
            cancelRequest();
          },
        },
      ],
    },
    [isPending, locale, profile]
  );

  useCustomContextMenu(
    {
      sectionTitle: t("messages.paintingAnnotation"),
      resource: annotationEditor.ref(),
      items: [
        {
          id: "edit-position",
          label: t("ui.editPosition"),
          enabled: !isPending && currentSelector?.type === "BoxSelector",
          onAction: () =>
            currentSelector?.type === "BoxSelector"
              ? requestAnnotation({ type: "target", bounds, selector: currentSelector.spatial as any })
              : undefined,
        },
        {
          id: "target-whole-canvas",
          label: t("ui.targetWholeCanvas"),
          enabled: currentSelector?.type === "BoxSelector",
          onAction: setTargetWholeCanvas,
        },
      ],
    },
    [currentSelector, isPending, locale, profile]
  );

  const store = useAtlasStore();
  const helper = useStore(store, (s) => s.polygons);
  useCurrentAnnotationTransition({
    requestId,
    onTransition: () => {
      // Assume 4 points.
      if (helper.state.transitionPoints) {
        const minX = Math.min(...helper.state.transitionPoints.map((p) => p[0]));
        const minY = Math.min(...helper.state.transitionPoints.map((p) => p[1]));
        const maxX = Math.max(...helper.state.transitionPoints.map((p) => p[0]));
        const maxY = Math.max(...helper.state.transitionPoints.map((p) => p[1]));

        const xOffset = minX < 0 ? minX : 0;
        const yOffset = minY < 0 ? minY : 0;

        target.setPosition({
          height: maxY - minY + yOffset,
          width: maxX - minX + xOffset,
          x: minX - xOffset,
          y: minY - yOffset,
        });
      }
    },
  });

  if (!currentSelector || currentSelector.type !== "BoxSelector") return null;

  return (
    <InputContainer $wide>
      <BoxSelectorField
        selector={currentSelector}
        form
        isDisabled={isActive}
        inlineFieldset
        onSubmit={(data) => {
          target.setPosition(data.spatial);
        }}
      >
        <ActionButton isDisabled={isActive} type="submit">
          {t("ui.updateTarget")}
        </ActionButton>
        <h3 className="text-md font-semibold my-4">{t("ui.changePositionOnCanvas")}</h3>
        <div className="flex gap-2">
          {isActive ? (
            <ActionButton primary onPress={() => completeRequest()}>
              <CheckIcon /> {t("ui.finishEditing")}
            </ActionButton>
          ) : (
            <ActionButton
              isDisabled={busy}
              onPress={() => requestAnnotation({ type: "target", bounds, selector: currentSelector.spatial })}
            >
              {t("ui.reposition")}
            </ActionButton>
          )}
          <ActionButton type="button" onPress={setTargetWholeCanvas}>
            {t("ui.targetWholeCanvas")}
          </ActionButton>
        </div>
      </BoxSelectorField>
    </InputContainer>
  );
}

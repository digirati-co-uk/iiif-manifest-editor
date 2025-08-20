import { useCustomContextMenu, useEditor } from "@manifest-editor/shell";
import { useAtlasStore, useCanvas, useCurrentAnnotationTransition, useRequestAnnotation } from "react-iiif-vault";
import { useStore } from "zustand";
import { InputContainer } from "../../components";
import { BoxSelectorField } from "../../form-elements/BoxSelectorField/BoxSelectorField";
import { ActionButton, CheckIcon } from "@manifest-editor/components";

export function MediaTargetEditor() {
  const canvas = useCanvas();
  const bounds = canvas ? { x: 0, y: 0, width: canvas.width, height: canvas.height } : null;
  const { requestAnnotation, isPending, isActive, busy, completeRequest, cancelRequest, requestId } = useRequestAnnotation({
    onSuccess: (response) => {
      if (response.boundingBox) {
        target.setPosition(response.boundingBox);
      }
    },
  });
  const annotationEditor = useEditor();
  const { target } = annotationEditor.annotation;
  const currentSelector = target.getParsedSelector();

  useCustomContextMenu(
    {
      sectionTitle: "Painting Annotation Target",
      resource: annotationEditor.ref(),
      items: [
        {
          id: "save-changes",
          label: "Save changes",
          enabled: isActive,
          onAction: () => {
            completeRequest();
          },
        },
        {
          id: "discard-changes",
          label: "Discard changes",
          enabled: isActive,
          onAction: () => {
            cancelRequest();
          },
        },
      ],
    },
    [isPending],
  );

  useCustomContextMenu(
    {
      sectionTitle: "Painting Annotation",
      resource: annotationEditor.ref(),
      items: [
        {
          id: "edit-position",
          label: "Edit position",
          enabled: !isPending && currentSelector?.type === "BoxSelector",
          onAction: () =>
            currentSelector?.type === "BoxSelector"
              ? requestAnnotation({ type: "target", bounds, selector: currentSelector.spatial as any })
              : undefined,
        },
        {
          id: "target-whole-canvas",
          label: "Target whole canvas",
          enabled: currentSelector?.type === "BoxSelector",
          onAction: () => target.removeSelector(),
        },
      ],
    },
    [currentSelector, isPending],
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
        <ActionButton isDisabled={isActive} type="submit">Update target</ActionButton>
        <h3 className="text-md font-semibold my-4">Change position on canvas</h3>
        <div className="flex gap-2">
          {isActive ? (
            <ActionButton primary onPress={() => completeRequest()}>
              <CheckIcon /> Finish editing
            </ActionButton>
          ) : (
            <ActionButton
              isDisabled={busy}
              onPress={() => requestAnnotation({ type: "target", bounds, selector: currentSelector.spatial })}
            >
              Reposition
            </ActionButton>
          )}
          <ActionButton type="button" onPress={() => target.removeSelector()}>
            Target whole canvas
          </ActionButton>
        </div>
      </BoxSelectorField>
    </InputContainer>
  );
}

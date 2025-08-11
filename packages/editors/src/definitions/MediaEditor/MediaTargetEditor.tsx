import { polygonToBoundingBox, useCustomContextMenu, useEditor } from "@manifest-editor/shell";
import { Button, ButtonGroup } from "@manifest-editor/ui/atoms/Button";
import { useAtlasStore, useCanvas, useCurrentAnnotationTransition, useRequestAnnotation } from "react-iiif-vault";
import { useDebounce } from "tiny-use-debounce";
import { useStore } from "zustand";
import { InputContainer } from "../../components";
import { BoxSelectorField } from "../../form-elements/BoxSelectorField/BoxSelectorField";

export function MediaTargetEditor() {
  const canvas = useCanvas();
  const bounds = canvas ? { x: 0, y: 0, width: canvas.width, height: canvas.height } : null;
  const { requestAnnotation, isPending, completeRequest, cancelRequest } = useRequestAnnotation({
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
      resource: annotationEditor.ref(),
      items: [
        {
          id: "save-changes",
          label: "Save changes",
          enabled: isPending,
          onAction: () => {
            completeRequest();
          },
        },
        {
          id: "discard-changes",
          label: "Discard changes",
          enabled: isPending,
          onAction: () => {
            cancelRequest();
          },
        },
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
        inlineFieldset
        onSubmit={(data) => {
          target.setPosition(data.spatial);
        }}
      >
        <ButtonGroup $right>
          <Button onClick={() => requestAnnotation({ type: "target", bounds, selector: currentSelector.spatial })}>
            Resize on canvas
          </Button>
          <Button type="button" onClick={() => target.removeSelector()}>
            Target whole canvas
          </Button>
          <Button type="submit">Update target</Button>
        </ButtonGroup>
      </BoxSelectorField>
    </InputContainer>
  );
}

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createAppActions, useInStack } from "@manifest-editor/editors";
import { useCreator, useEditingStack, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { useCallback } from "react";
import { CanvasContext, useManifest } from "react-iiif-vault";
import { getSlideSelectionAfterDeletion } from "../helpers/slide-selection";
import { ExhibitionContainer } from "./ExhibitionContainer";
import { SortableExhibitionItem } from "./SortableExhibitionItem";

export function SortableExhibitionGrid() {
  const manifest = useManifest();
  const { structural, technical } = useManifestEditor();
  const editingStack = useEditingStack();
  const editingCanvas = useInStack("Canvas");

  const items = structural.items.get();
  const { open } = useLayoutActions();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [, canvasActions] = useCreator({ id: technical.id.get(), type: "Manifest" }, "items", "Canvas");

  const onDragEnd = useCallback(
    (result: DragEndEvent) => {
      const { active, over } = result;
      if (over && active.id !== over.id) {
        structural.items.reorder(
          items.findIndex((item) => item.id === active.id),
          items.findIndex((item) => item.id === over.id),
        );
      }
    },
    [items, structural.items],
  );

  const canvasId = editingCanvas?.resource.source.id;
  function onDeleteCanvas(deletedId: string) {
    if (canvasId !== deletedId) return;

    const nextCanvasId = getSlideSelectionAfterDeletion(items, canvasId, deletedId);
    editingStack.close();

    if (nextCanvasId) {
      const newCanvases = structural.items.getWithoutTracking();
      const nextIndex = newCanvases.findIndex((item) => item.id === nextCanvasId);
      const nextCanvas = newCanvases[nextIndex];
      if (nextCanvas) canvasActions.edit(nextCanvas, nextIndex);
    }
  }

  return (
    <ExhibitionContainer>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.map((item, idx) => {
            if (!item) return null;
            return (
              <CanvasContext key={item.id} canvas={item.id}>
                <SortableExhibitionItem
                  key={item.id}
                  item={item}
                  isFirst={idx === 0}
                  onClick={() => {
                    open({ id: "current-canvas" });
                    canvasActions.edit(item, idx);
                  }}
                  actions={createAppActions(structural.items, () => onDeleteCanvas(item.id))(item, idx, manifest!)}
                />
              </CanvasContext>
            );
          })}
        </SortableContext>
      </DndContext>
    </ExhibitionContainer>
  );
}

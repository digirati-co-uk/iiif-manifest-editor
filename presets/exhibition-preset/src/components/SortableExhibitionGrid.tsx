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
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createAppActions, useInStack } from "@manifest-editor/editors";
import { useCreator, useEditingStack, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { useCallback } from "react";
import { CanvasContext, useManifest } from "react-iiif-vault/presentation-4";
import { getSlideSelectionAfterDeletion } from "../helpers/slide-selection";
import { ExhibitionContainer } from "./ExhibitionContainer";
import { ExhibitionPreviewListLayout, type PreviewMode } from "./ExhibitionPreviewList";
import { SortableExhibitionItem } from "./SortableExhibitionItem";

export function SortableExhibitionGrid({ mode = "grid" }: { mode?: PreviewMode | "grid" }) {
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

  const sortableItems = items.map((item, idx) => {
    if (!item) return null;
    return (
      <CanvasContext key={item.id} canvas={item.id}>
        <SortableExhibitionItem
          item={item}
          isFirst={idx === 0}
          mode={mode === "grid" ? undefined : mode}
          onClick={() => {
            open({ id: "current-canvas" });
            canvasActions.edit(item, idx);
          }}
          actions={createAppActions(structural.items, () => onDeleteCanvas(item.id))(item, idx, manifest!)}
        />
      </CanvasContext>
    );
  });
  const layout =
    mode === "grid" ? (
      <ExhibitionContainer>{sortableItems}</ExhibitionContainer>
    ) : (
      <ExhibitionPreviewListLayout>{sortableItems}</ExhibitionPreviewListLayout>
    );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext
        items={items}
        strategy={mode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {layout}
      </SortableContext>
    </DndContext>
  );
}

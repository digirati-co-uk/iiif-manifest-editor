import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  useCreator,
  useLayoutActions,
  useManifestEditor,
} from "@manifest-editor/shell";
import { useCallback } from "react";
import { CanvasContext } from "react-iiif-vault";
import { ExhibitionContainer } from "./ExhibitionContainer";
import { SortableExhibitionItem } from "./SortableExhibitionItem";

export function SortableExhibitionGrid() {
  const { structural, technical } = useManifestEditor();
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
  const [, canvasActions] = useCreator(
    { id: technical.id.get(), type: "Manifest" },
    "items",
    "Manifest",
  );

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
                />
              </CanvasContext>
            );
          })}
        </SortableContext>
      </DndContext>
    </ExhibitionContainer>
  );
}

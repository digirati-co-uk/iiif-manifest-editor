import { ResourceProvider } from "react-iiif-vault";
import { ReactNode, useCallback } from "react";
import { ReorderListItem } from "../ReorderListItem/ReorderListItem.dndkit";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { AppDropdownItem } from "../../../../ui/ui/AppDropdown/AppDropdown";

export interface ReorderListProps<T extends { id: string; type?: string }> {
  id: string;
  items: T[];
  renderItem: (ref: T, index: number, item: T) => ReactNode;
  inlineHandle?: boolean;
  reorder: (result: { startIndex: number; endIndex: number }) => void;
  createActions?: (ref: T, index: number, item: T) => AppDropdownItem[];
  marginBottom?: string | number;
  grid?: boolean;
}

export function ReorderList<T extends { id: string; type?: string }>({
  items,
  renderItem,
  id,
  reorder,
  inlineHandle = true,
  createActions,
  marginBottom,
  grid,
}: ReorderListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = useCallback(
    (result: DragEndEvent) => {
      const { active, over } = result;
      if (over && active.data.current?.ref !== over.data.current?.ref) {
        reorder({
          startIndex: items.indexOf(active.data.current?.ref),
          endIndex: items.indexOf(over.data.current?.ref),
        });
      }
    },
    [items, reorder]
  );

  const enabled = items.length > 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {items.map((item, idx) => {
          if (!item) {
            return null;
          }
          return (
            <ReorderListItem
              key={item.id as string}
              item={item}
              inlineHandle={inlineHandle}
              reorderEnabled={enabled}
              actions={createActions ? createActions(item, idx, item) : undefined}
              marginBottom={marginBottom}
              grid={grid}
            >
              {item.type ? (
                <ResourceProvider value={{ [item.type]: item.id }}>{renderItem(item, idx, item)}</ResourceProvider>
              ) : (
                renderItem(item, idx, item)
              )}
            </ReorderListItem>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type ReactNode, useCallback } from "react";
import { ResourceProvider } from "react-iiif-vault";
import type { AppDropdownItem } from "../AppDropdown/AppDropdown";
import { ReorderListItem } from "../ReorderListItem/ReorderListItem.dndkit";

export interface ReorderListProps<T extends { id: string; type?: string }> {
  id: string;
  items: T[];
  renderItem: (ref: T, index: number, item: T) => ReactNode;
  inlineHandle?: boolean;
  reorder: (result: { startIndex: number; endIndex: number }) => void;
  createActions?: (ref: T, index: number, item: T) => AppDropdownItem[];
  marginBottom?: string | number;
}

export function ReorderList<T extends { id: string; type?: string }>({
  items,
  renderItem,
  id,
  reorder,
  inlineHandle = true,
  createActions,
  marginBottom,
}: ReorderListProps<T>) {
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
    [items, reorder],
  );

  const enabled = items.length > 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
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
              actions={
                createActions ? createActions(item, idx, item) : undefined
              }
              marginBottom={marginBottom}
            >
              {item.type ? (
                <ResourceProvider value={{ [item.type]: item.id }}>
                  {renderItem(item, idx, item)}
                </ResourceProvider>
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

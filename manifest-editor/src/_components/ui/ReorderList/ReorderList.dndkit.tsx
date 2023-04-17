import { ResourceProvider } from "react-iiif-vault";
import { ReactNode, useCallback, useMemo } from "react";
import { ReorderListItem } from "@/_components/ui/ReorderListItem/ReorderListItem.dndkit";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { toRef } from "@iiif/parser";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { AppDropdownItem } from "../AppDropdown/AppDropdown";

export interface ReorderListProps {
  id: string;
  items: Reference[];
  renderItem: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
  inlineHandle?: boolean;
  reorder: (result: { startIndex: number; endIndex: number }) => void;
  createActions?: (ref: Reference, index: number, item: Reference | SpecificResource) => AppDropdownItem[];
  marginBottom?: string | number;
}

export function ReorderList({
  items,
  renderItem,
  id,
  reorder,
  inlineHandle = true,
  createActions,
  marginBottom,
}: ReorderListProps) {
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

  const enabled = items.length > 1;

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
              actions={createActions ? createActions(item, idx, item) : undefined}
              marginBottom={marginBottom}
            >
              <ResourceProvider value={{ [item.type]: item.id }}>{renderItem(item, idx, item)}</ResourceProvider>
            </ReorderListItem>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

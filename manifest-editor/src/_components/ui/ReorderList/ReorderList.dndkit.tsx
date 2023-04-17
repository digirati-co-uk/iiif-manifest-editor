import { ResourceProvider } from "react-iiif-vault";
import { ReactNode, useCallback } from "react";
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
  items: (Reference | SpecificResource)[];
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
      if (over && active.id !== over.id) {
        reorder({
          startIndex: items.findIndex((t) => toRef(t)?.id === active.id),
          endIndex: items.findIndex((t) => toRef(t)?.id === over.id),
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
      <SortableContext items={items.map((t) => toRef(t) as any)} strategy={verticalListSortingStrategy}>
        {items.map((item, idx) => {
          const ref = toRef(item);
          if (!ref) {
            return null;
          }
          return (
            <ReorderListItem
              key={ref.id as string}
              id={ref.id as string}
              inlineHandle={inlineHandle}
              reorderEnabled={enabled}
              actions={createActions ? createActions(ref, idx, item) : undefined}
              marginBottom={marginBottom}
            >
              <ResourceProvider value={{ [ref.type]: ref.id }}>{renderItem(ref, idx, item)}</ResourceProvider>
            </ReorderListItem>
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

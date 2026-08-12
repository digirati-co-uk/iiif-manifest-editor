import { ResourceReactContext } from "react-iiif-vault/presentation-4";
import { type ReactNode, useCallback } from "react";
import { ReorderListItem } from "../ReorderListItem/ReorderListItem.dndkit";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import type { AppDropdownItem } from "../AppDropdown/AppDropdown";

export interface ReorderListProps<T extends { id: string; type?: string }> {
  id: string;
  items: T[];
  renderItem: (ref: T, index: number, item: T) => ReactNode;
  inlineHandle?: boolean;
  reorder: (result: { startIndex: number; endIndex: number }) => void;
  createActions?: (ref: T, index: number, item: T) => AppDropdownItem[];
  inlineActions?: (ref: T, index: number, item: T) => ReactNode;
  marginBottom?: string | number;
  grid?: boolean;
  list?: boolean;
  itemClassName?: string;
}

export function ReorderList<T extends { id: string; type?: string }>({
  items,
  renderItem,
  id,
  reorder,
  inlineHandle = true,
  createActions,
  inlineActions,
  marginBottom,
  grid,
  list,
  itemClassName,
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
  function renderItemRow(item: T, idx: number) {
    if (!item) {
      return null;
    }
    return (
      <ReorderListItem
        as={list ? "li" : undefined}
        key={item.id as string}
        item={item}
        inlineHandle={inlineHandle}
        reorderEnabled={enabled}
        actions={createActions ? createActions(item, idx, item) : undefined}
        inlineActions={inlineActions ? inlineActions(item, idx, item) : undefined}
        marginBottom={marginBottom}
        grid={grid}
        className={itemClassName}
      >
        {item.type ? (
          <ResourceReactContext.Provider value={{ [item.type]: item.id }}>
            {renderItem(item, idx, item)}
          </ResourceReactContext.Provider>
        ) : (
          renderItem(item, idx, item)
        )}
      </ReorderListItem>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        {list ? <ul>{items.map(renderItemRow)}</ul> : items.map(renderItemRow)}
      </SortableContext>
    </DndContext>
  );
}

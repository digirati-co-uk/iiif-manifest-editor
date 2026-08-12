import { ResourceReactContext } from "react-iiif-vault/presentation-4";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import { ReactNode, useCallback } from "react";
import { StrictModeDroppable } from "./strict-mode-droppable";
import type { Reference, SpecificResource } from "@iiif/parser/presentation-4/types";
import { toRef } from "@iiif/parser/presentation-4";
import { ReorderListItem } from "../ReorderListItem/ReorderListItem";

export interface ReorderListProps {
  id: string;
  items: (Reference | SpecificResource)[];
  renderItem: (ref: Reference, index: number, item: Reference | SpecificResource) => ReactNode;
  inlineHandle?: boolean;
  reorder: (result: { startIndex: number; endIndex: number }) => void;
}

export function ReorderList({ items, renderItem, id, reorder, inlineHandle = true }: ReorderListProps) {
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (result.destination) {
        reorder({
          startIndex: result.source.index,
          endIndex: result.destination?.index,
        });
      }
    },
    [reorder]
  );

  const enabled = items.length > 1;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <StrictModeDroppable droppableId={id}>
          {(provided) => (
            <div style={{ position: "relative" }} {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, idx) => {
                const ref = toRef(item);
                if (!ref) {
                  return null;
                }
                return (
                  <Draggable key={item.id} draggableId={ref.id} index={idx} isDragDisabled={!enabled}>
                    {(innerProvided, snapshot) => {
                      if (snapshot.isDragging && innerProvided.draggableProps.style) {
                        (innerProvided.draggableProps.style as any).top = "auto";
                      }

                      return (
                        <ReorderListItem
                          inlineHandle={inlineHandle}
                          reorderEnabled={enabled}
                          ref={innerProvided.innerRef}
                          handleProps={innerProvided.dragHandleProps}
                          {...innerProvided.draggableProps}
                        >
                          <ResourceReactContext.Provider value={{ [ref.type]: ref.id }}>
                            {renderItem(ref, idx, item)}
                          </ResourceReactContext.Provider>
                        </ReorderListItem>
                      );
                    }}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    </>
  );
}

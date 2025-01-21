import { ResourceProvider } from "react-iiif-vault";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import { ReactNode, useCallback } from "react";
import { StrictModeDroppable } from "./strict-mode-droppable";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { toRef } from "@iiif/parser";
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
                          <ResourceProvider value={{ [ref.type]: ref.id }}>
                            {renderItem(ref, idx, item)}
                          </ResourceProvider>
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

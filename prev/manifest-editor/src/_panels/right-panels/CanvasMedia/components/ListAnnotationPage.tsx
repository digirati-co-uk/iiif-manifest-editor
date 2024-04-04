import { AnnotationContext, useAnnotationPage, useVault } from "react-iiif-vault";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import { ReactNode, useCallback } from "react";
import { reorderEntityField } from "@iiif/helpers/vault/actions";
import invariant from "tiny-invariant";
import { StrictModeDroppable } from "@/helpers/strict-mode-droppable";
import { useTaskDispatch } from "@/shell/TaskBridge/TaskBridge";
import { ReorderListItem } from "@/_components/ui/ReorderListItem/ReorderListItem";

export interface ListAnnotationPageProps {
  renderAnnotation: (annotation: string) => ReactNode;
  inlineHandle?: boolean;
}

export function ListAnnotationPage({ renderAnnotation, inlineHandle = true }: ListAnnotationPageProps) {
  const annotationPage = useAnnotationPage();
  const vault = useVault();
  const [refreshCanvas] = useTaskDispatch("refresh-canvas");

  const onDragEnd = useCallback(
    (result: DropResult) => {
      invariant(annotationPage);
      if (result.destination) {
        vault.dispatch(
          reorderEntityField({
            id: annotationPage.id,
            type: "AnnotationPage",
            key: "items",
            startIndex: result.source.index,
            endIndex: result.destination?.index,
          })
        );
        refreshCanvas();
      }
    },
    [annotationPage, refreshCanvas, vault]
  );

  if (!annotationPage) {
    return null;
  }

  const enabled = annotationPage.items.length > 1;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <StrictModeDroppable droppableId="annotation-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {annotationPage.items.map((annotation, idx) => (
                <Draggable key={annotation.id} draggableId={annotation.id} index={idx} isDragDisabled={!enabled}>
                  {(innerProvided) => (
                    <ReorderListItem
                      inlineHandle={inlineHandle}
                      reorderEnabled={enabled}
                      ref={innerProvided.innerRef}
                      handleProps={innerProvided.dragHandleProps}
                      {...innerProvided.draggableProps}
                    >
                      <AnnotationContext annotation={annotation.id}>
                        {renderAnnotation(annotation.id)}
                      </AnnotationContext>
                    </ReorderListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    </>
  );
}

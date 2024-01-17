import { useCanvas, useVault } from "react-iiif-vault";
import { Button } from "@/atoms/Button";
import { EmptyProperty } from "@/atoms/EmptyProperty";
import { MediaResourcePreview } from "./MediaResourcePreview";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { DeleteIcon } from "@/icons/DeleteIcon";
import { FlexContainerRow } from "@/components/layout/FlexContainer";
import { LightBoxWithoutSides } from "@/atoms/LightBox";
import { EditIcon } from "@/icons/EditIcon";
import { EditableContainer } from "@/atoms/EditableContainer";
import { useLayoutActions } from "@/shell/Layout/Layout.context";

import { removeReference, reorderEntityField } from "@iiif/helpers/vault/actions";
import invariant from "tiny-invariant";
import { AnnotationNormalized, AnnotationPageNormalized } from "@iiif/presentation-3";

export const PaintingAnnotationsForm: React.FC = () => {
  const canvas = useCanvas();
  const vault = useVault();
  const layouts = useLayoutActions();

  const onDragEnd = (page: AnnotationPageNormalized, result: DropResult) => {
    const destination = result.destination;
    if (!destination) {
      return;
    }
    reorder(page, result.source.index, destination.index);
  };

  const reorder = (page: AnnotationPageNormalized, startIndex: number, endIndex: number) => {
    vault.dispatch(
      reorderEntityField({
        id: page.id,
        type: "AnnotationPage",
        startIndex,
        endIndex,
        key: "items",
      })
    );
  };

  const moveUp = (page: AnnotationPageNormalized, idx: number) => {
    reorder(page, idx, idx - 1);
  };

  const moveDown = (page: AnnotationPageNormalized, idx: number) => {
    reorder(page, idx, idx + 1);
  };

  const remove = (page: AnnotationPageNormalized, annotation: AnnotationNormalized) => {
    invariant(canvas, "Canvas not selected");
    vault.dispatch(
      removeReference({
        id: page.id,
        type: "AnnotationPage",
        key: "items",
        reference: { id: annotation.id, type: "Annotation" },
      })
    );
  };

  return (
    <EditableContainer>
      <EmptyProperty
        guidanceReference={"https://iiif.io/api/presentation/3.0/#55-annotation-page "}
        label={"items"}
        createNew={() => layouts.change("new-annotation-page")}
      />
      <DragDropContext onDragEnd={(result) => onDragEnd(vault.get(canvas?.items[0]), result)}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
              }}
            >
              {vault &&
                canvas &&
                vault.get(canvas.items).map((item: any, index) => {
                  const items = vault.get(item?.id);
                  return (
                    items &&
                    item.items.map((nested: any, idx: number) => {
                      return (
                        <Draggable key={nested.id} draggableId="droppable" index={idx}>
                          {(innerProvided: any) => (
                            <LightBoxWithoutSides
                              ref={innerProvided.innerRef}
                              key={nested.id}
                              {...innerProvided.draggableProps}
                              {...innerProvided.dragHandleProps}
                            >
                              <FlexContainerRow style={{ alignItems: "center", width: "100%" }}>
                                <MediaResourcePreview thumbnailSrc={nested.id} />

                                {idx > 0 ? <Button onClick={() => moveUp(item, idx)}>up</Button> : null}
                                {idx < item.items.length - 1 ? (
                                  <Button onClick={() => moveDown(item, idx)}>down</Button>
                                ) : null}

                                <Button
                                  onClick={() =>
                                    layouts.stack("canvas-media", { annotationPage: item.id, annotation: nested.id })
                                  }
                                  title="edit"
                                >
                                  <EditIcon />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    remove(item, nested);
                                  }}
                                  title="remove"
                                >
                                  <DeleteIcon />
                                </Button>
                              </FlexContainerRow>
                            </LightBoxWithoutSides>
                          )}
                        </Draggable>
                      );
                    })
                  );
                })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </EditableContainer>
  );
};

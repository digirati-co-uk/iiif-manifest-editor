import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useCanvas, useVault } from "react-iiif-vault";
import { Button } from "../../atoms/Button";
import { EditableContainer } from "../../atoms/EditableContainer";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { LightBoxWithoutSides } from "../../atoms/LightBox";
import { ThumbnailImg } from "../../atoms/Thumbnail";
import { ThumbnailContainer } from "../../atoms/ThumbnailContainer";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { FlexContainer, FlexContainerRow } from "../../components/layout/FlexContainer";
import { usePanelActions } from "../../shell/Layout/Layout.hooks";
import { useLayoutActions } from "@/shell/Layout/Layout.context";

// Handles the whole list and speaks to the vault.
export const ThumbnailForm = () => {
  const canvas = useCanvas();
  const vault = useVault();
  const layouts = useLayoutActions();

  const onDragEnd = (result: DropResult) => {
    const destination = result.destination;
    if (!destination) {
      return;
    }
    reorder(result.source.index, destination.index);
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = canvas ? [...canvas.thumbnail] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (canvas) {
      vault.modifyEntityField(canvas, "thumbnail", newOrder);
    }
  };

  const remove = (index: number) => {
    const newThumbnail = canvas && canvas.thumbnail ? [...canvas.thumbnail] : [];

    if (canvas && (index || index === 0)) {
      newThumbnail.splice(index, 1);

      // Provide the vault with an updated list of content resources
      vault.modifyEntityField(canvas, "thumbnail", newThumbnail);
    }
  };

  if (!canvas || !vault) {
    return <div>Something went wrong</div>;
  }

  return (
    <EditableContainer>
      <EmptyProperty
        guidanceReference={"https://iiif.io/api/presentation/3.0/#thumbnail"}
        label={"thumbnail"}
        createNew={() => layouts.change("new-canvas-thumbnail")}
      />
      <DragDropContext onDragEnd={onDragEnd}>
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
                vault.get(canvas.thumbnail).map((thumbnail: any, index) => {
                  return (
                    <Draggable
                      key={thumbnail.toString() + "--HASH--"}
                      draggableId={index.toString() + "--HASH--"}
                      index={index}
                    >
                      {(innerProvided: any) => (
                        <LightBoxWithoutSides
                          ref={innerProvided.innerRef}
                          {...innerProvided.draggableProps}
                          {...innerProvided.dragHandleProps}
                          key={thumbnail.id}
                        >
                          <FlexContainerRow
                            style={{
                              alignItems: "center",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <FlexContainer>
                              <Button onClick={() => remove(index)} title="remove">
                                <DeleteIcon />
                              </Button>
                              <FlexContainer>
                                <ThumbnailContainer size={32}>
                                  <ThumbnailImg src={thumbnail.id} alt="thumbnail" />
                                </ThumbnailContainer>
                                <div style={{ padding: "10px" }}>{thumbnail.type}</div>
                              </FlexContainer>
                            </FlexContainer>
                            {/* <Button
                              onClick={() => editorContext?.changeSelectedProperty("canvas thumbnail", index)}
                              title="edit"
                            >
                              <EditIcon />
                            </Button> */}
                          </FlexContainerRow>
                        </LightBoxWithoutSides>
                      )}
                    </Draggable>
                  );
                })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </EditableContainer>
  );
};

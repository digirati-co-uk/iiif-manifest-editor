import { addMapping, importEntities } from "@iiif/vault/actions";
import { IIIFBuilder } from "iiif-builder";
import { useContext } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import ShellContext from "../../apps/Shell/ShellContext";
import { Button } from "../../atoms/Button";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { MediaResourcePreview } from "./MediaResourcePreview";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { FlexContainerRow } from "../../components/layout/FlexContainer";
import { LightBoxWithoutSides } from "../../atoms/LightBox";
import { EditIcon } from "../../icons/EditIcon";
import { EditableContainer } from "../../atoms/EditableContainer";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";

export const PaintingAnnotationsForm: React.FC = () => {
  const canvas = useCanvas();
  const vault = useVault();
  const shellContext = useContext(ShellContext);
  const editorContext = useContext(ManifestEditorContext);

  const onDragEnd = (result: DropResult) => {
    const destination = result.destination;
    if (!destination) {
      return;
    }
    reorder(result.source.index, destination.index);
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = canvas ? [...canvas.items] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, "items", newOrder);
    }
  };

  const remove = (index: number) => {
    const copy = canvas && canvas.items ? [...canvas.items] : [];
    if (canvas && (index || index === 0)) {
      copy.splice(index, 1);
      shellContext?.setUnsavedChanges(true);
      // Provide the vault with an updated list of content resources
      // with the item removed
      vault.modifyEntityField(canvas, "items", copy);
    }
  };

  return (
    <EditableContainer>
      <EmptyProperty
        guidanceReference={"https://iiif.io/api/presentation/3.0/#55-annotation-page "}
        label={"items"}
        createNew={() => editorContext?.changeSelectedProperty("canvas item", -1)}
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
                vault.get(canvas.items).map((item: any, index) => {
                  const items = vault.get(item?.id);
                  return (
                    items &&
                    item.items.map((NESTEDITEM: any, idx: number) => {
                      return (
                        <Draggable
                          key={NESTEDITEM.toString() + "--HASH--"}
                          draggableId={index.toString() + "--HASH--"}
                          index={index}
                        >
                          {(innerProvided: any) => (
                            <LightBoxWithoutSides
                              ref={innerProvided.innerRef}
                              {...innerProvided.draggableProps}
                              {...innerProvided.dragHandleProps}
                              key={item.id}
                            >
                              <FlexContainerRow style={{ alignItems: "center", width: "100%" }}>
                                <Button onClick={() => remove(index)} title="remove">
                                  <DeleteIcon />
                                </Button>
                                <MediaResourcePreview thumbnailSrc={NESTEDITEM.id} />
                                <Button
                                  onClick={() => editorContext?.changeSelectedProperty("canvas item", index)}
                                  title="edit"
                                >
                                  <EditIcon />
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

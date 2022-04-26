import { useContext, useState } from "react";
import { useVault } from "react-iiif-vault";
import { useCanvas } from "react-iiif-vault";
import ShellContext from "../../apps/Shell/ShellContext";
import { Button, SecondaryButton } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import { Input } from "../Input";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { MenuIcon } from "../../icons/MenuIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { LanguageFieldEditor } from "../LanguageFieldEditor";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { EmptyProperty } from "../../atoms/EmptyProperty";

export const ExternalResource: React.FC<{
  dispatchType: "homepage" | "service" | "seeAlso" | "rendering";
}> = ({ dispatchType }) => {
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const vault = useVault();
  const [redraw, setRedraw] = useState(0);

  const updateValue = (newValue: string, index: number) => {
    const newContentResource =
      canvas && canvas[dispatchType] ? [...canvas[dispatchType]] : [];
    if (canvas && (index || index === 0) && newValue) {
      newContentResource[index] = {
        id: newValue,
        type: "ContentResource",
      };
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newContentResource);
    }
  };

  const removeItem = (index: number) => {
    const newContentResource =
      canvas && canvas[dispatchType] ? [...canvas[dispatchType]] : [];

    if (canvas && (index || index === 0)) {
      newContentResource.splice(index, 1);
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newContentResource);
    }
  };

  const addNew = () => {
    const newContentResource = canvas ? [...canvas[dispatchType]] : [];
    newContentResource.push({ id: "", type: "ContentResource" });
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newContentResource);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = canvas ? [...canvas[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, newOrder);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const destination = result.destination;
    if (!destination) {
      return;
    }
    setRedraw(redraw + 1);
    reorder(result.source.index, destination.index);
  };
  return (
    <>
      <EmptyProperty label={dispatchType} createNew={addNew} />

      <DragDropContext onDragEnd={onDragEnd} key={redraw}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {canvas &&
                canvas[dispatchType] &&
                Array.isArray(canvas[dispatchType]) &&
                canvas[dispatchType].map((item: any, index) => {
                  return (
                    <Draggable
                      key={item?.id?.toString() + "--HASH--"}
                      draggableId={item?.id?.toString() + "--HASH--"}
                      index={index}
                    >
                      {(innerProvided) => (
                        <>
                          <FlexContainer
                            ref={innerProvided.innerRef}
                            {...innerProvided.draggableProps}
                            {...innerProvided.dragHandleProps}
                            key={index}
                            style={{ justifyContent: "space-between" }}
                          >
                            <MenuIcon />
                            <FlexContainerColumn style={{ width: "100%" }}>
                              {item?.label && (
                                <LanguageFieldEditor
                                  label=""
                                  fields={item.label}
                                />
                              )}
                              <Input
                                type="string"
                                onChange={(e: any) => {
                                  updateValue(e.target.value, index);
                                }}
                                value={item.id}
                              />
                              {item.type && (
                                <Input
                                  type="string"
                                  // onChange={(e: any) => {
                                  //   changeType(e.target.value, index);
                                  // }}
                                  value={item.type}
                                />
                              )}
                            </FlexContainerColumn>
                            <Button
                              aria-label="delete"
                              onClick={() => removeItem(index)}
                            >
                              <DeleteIcon />
                            </Button>
                          </FlexContainer>
                          {index !== canvas[dispatchType].length - 1 && (
                            <HorizontalDivider />
                          )}
                        </>
                      )}
                    </Draggable>
                  );
                })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

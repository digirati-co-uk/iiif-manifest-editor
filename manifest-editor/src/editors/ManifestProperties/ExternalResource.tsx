import { useState } from "react";
import { useVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { Button } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../components/layout/FlexContainer";
import { Input } from "../Input";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { MenuIcon } from "../../icons/MenuIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { LanguageFieldEditor } from "../generic/LanguageFieldEditor/LanguageFieldEditor";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { EmptyProperty } from "../../atoms/EmptyProperty";

export const ExternalResource: React.FC<{
  dispatchType: "homepage" | "service" | "services" | "seeAlso" | "rendering";

  guidanceReference?: string;
}> = ({ dispatchType, guidanceReference }) => {
  const manifest = useManifest();
  const vault = useVault();
  const [redraw, setRedraw] = useState(0);

  const updateValue = (newValue: string, index: number) => {
    const newContentResource = manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];
    if (manifest && (index || index === 0) && newValue) {
      newContentResource[index] = {
        id: newValue,
        type: "ContentResource",
      };

      vault.modifyEntityField(manifest, dispatchType, newContentResource);
    }
  };

  const removeItem = (index: number) => {
    const newContentResource = manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];

    if (manifest && (index || index === 0)) {
      newContentResource.splice(index, 1);

      vault.modifyEntityField(manifest, dispatchType, newContentResource);
    }
  };

  const addNew = () => {
    const newContentResource = manifest ? [...manifest[dispatchType]] : [];
    newContentResource.push({ id: "", type: "ContentResource" });
    if (manifest) {
      vault.modifyEntityField(manifest, dispatchType, newContentResource);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = manifest ? [...manifest[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (manifest) {
      vault.modifyEntityField(manifest, dispatchType, newOrder);
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
      <EmptyProperty label={dispatchType} createNew={addNew} guidanceReference={guidanceReference} />
      <DragDropContext onDragEnd={onDragEnd} key={redraw}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {manifest &&
                manifest[dispatchType] &&
                Array.isArray(manifest[dispatchType]) &&
                manifest[dispatchType].map((item: any, index) => {
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
                              {item?.label && <LanguageFieldEditor label="" fields={item.label} />}
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
                            <Button aria-label="delete" onClick={() => removeItem(index)}>
                              <DeleteIcon />
                            </Button>
                          </FlexContainer>
                          {index !== manifest[dispatchType].length - 1 && <HorizontalDivider />}
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

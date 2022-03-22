import { useContext, useState } from "react";
import { useVault } from "react-iiif-vault";
import { useManifest } from "../../../hooks/useManifest";
import ShellContext from "../../apps/Shell/ShellContext";
import { Button, SecondaryButton } from "../../atoms/Button";
import { FlexContainer } from "../../layout/FlexContainer";
import { Input } from "../Input";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { MenuIcon } from "../../icons/MenuIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";

export const ExternalResource: React.FC<{
  dispatchType: "homepage" | "services" | "seeAlso" | "rendering";
}> = ({ dispatchType }) => {
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();
  const [redraw, setRedraw] = useState(0);

  const updateValue = (newValue: string, index: number) => {
    const newContentResource =
      manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];
    if (manifest && (index || index === 0) && newValue) {
      newContentResource[index] = {
        id: newValue,
        type: "ContentResource",
      };
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newContentResource);
    }
  };

  const removeItem = (index: number) => {
    const newContentResource =
      manifest && manifest[dispatchType] ? [...manifest[dispatchType]] : [];

    if (manifest && (index || index === 0)) {
      newContentResource.splice(index, 1);
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newContentResource);
    }
  };

  const addNew = () => {
    const newContentResource = manifest ? [...manifest[dispatchType]] : [];
    newContentResource.push({ id: "", type: "ContentResource" });
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, newContentResource);
    }
  };

  const reorder = (fromPosition: number, toPosition: number) => {
    const newOrder = manifest ? [...manifest[dispatchType]] : [];
    const [removed] = newOrder.splice(fromPosition, 1);
    newOrder.splice(toPosition, 0, removed);
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
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
      <DragDropContext onDragEnd={onDragEnd} key={redraw}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {manifest &&
                manifest[dispatchType] &&
                Array.isArray(manifest[dispatchType]) &&
                manifest[dispatchType].map((item, index) => {
                  return (
                    <Draggable
                      key={item.id.toString() + "--HASH--"}
                      draggableId={item.id.toString() + "--HASH--"}
                      index={index}
                    >
                      {(innerProvided) => (
                        <FlexContainer
                          ref={innerProvided.innerRef}
                          {...innerProvided.draggableProps}
                          {...innerProvided.dragHandleProps}
                          key={index}
                        >
                          <MenuIcon />
                          <Input
                            type="string"
                            onChange={(e: any) => {
                              updateValue(e.target.value, index);
                            }}
                            value={item.id}
                          />
                          <Button onClick={() => removeItem(index)}>
                            <DeleteIcon />
                          </Button>
                        </FlexContainer>
                      )}
                    </Draggable>
                  );
                })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <FlexContainer style={{ justifyContent: "center" }}>
        <SecondaryButton onClick={() => addNew()}>
          Add new {dispatchType}
        </SecondaryButton>
      </FlexContainer>
    </>
  );
};

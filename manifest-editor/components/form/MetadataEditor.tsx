import React, { useState } from "react";
import { Button } from "../atoms/Button";
import { DeleteIcon } from "../icons/DeleteIcon";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { LanguageFieldEditor } from "./LanguageFieldEditor";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { LightBox } from "../atoms/LightBox";

interface MetadataEditorProps {
  availableLanguages: string[];
  fields: any[];
  onSave: (data: any, index?: number, property?: "label" | "value") => void;
  removeItem: (index: number) => void;
  reorder: (fromPosition: number, toPosition: number) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  availableLanguages,
  fields,
  onSave,
  removeItem,
  reorder,
}) => {
  const [redraw, setRedraw] = useState(0);
  const onDragEnd = (result: DropResult) => {
    const destination = result.destination;
    if (!destination) {
      return;
    }
    setRedraw(redraw + 1);
    reorder(result.source.index, destination.index);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd} key={redraw}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {Array.isArray(fields) &&
              fields.map((field, index) => {
                return (
                  <Draggable
                    key={field.toString() + "--HASH--"}
                    draggableId={index.toString() + "--HASH--"}
                    index={index}
                  >
                    {(innerProvided) => (
                      <LightBox
                        ref={innerProvided.innerRef}
                        {...innerProvided.draggableProps}
                        {...innerProvided.dragHandleProps}
                        key={index}
                      >
                        <FlexContainer
                          style={{ justifyContent: "space-between" }}
                        >
                          <FlexContainerColumn>
                            <LanguageFieldEditor
                              label={"label"}
                              fields={field.label}
                              availableLanguages={availableLanguages}
                              onSave={onSave}
                              index={index}
                              property={"label"}
                            />
                            <LanguageFieldEditor
                              label={"value"}
                              fields={field.value}
                              availableLanguages={availableLanguages}
                              onSave={onSave}
                              index={index}
                              property={"value"}
                            />
                          </FlexContainerColumn>
                          <Button onClick={() => removeItem(index)}>
                            <DeleteIcon />
                          </Button>
                        </FlexContainer>
                      </LightBox>
                    )}
                  </Draggable>
                );
              })}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

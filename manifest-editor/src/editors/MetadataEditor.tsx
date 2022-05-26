import React, { useState } from "react";
import { Button, SmallButton } from "../atoms/Button";
import { DeleteIcon } from "../icons/DeleteIcon";
import { FlexContainer, FlexContainerColumn } from "../components/layout/FlexContainer";
import { LanguageFieldEditor } from "./LanguageFieldEditor";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { LightBox } from "../atoms/LightBox";
import { MetadataPair } from "./MetadataPair";

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

  const reorderAndRedraw = (fromPosition: number, toPosition: number) => {
    setRedraw(redraw + 1);
    reorder(fromPosition, toPosition);
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
                    key={field.label.toString() + "--HASH--"}
                    draggableId={index.toString() + "--HASH--"}
                    index={index}
                  >
                    {(innerProvided) => (
                      <LightBox
                        ref={innerProvided.innerRef}
                        {...innerProvided.draggableProps}
                        {...innerProvided.dragHandleProps}
                        key={index}
                        style={{ paddingBottom: "1rem" }}
                      >
                        <MetadataPair
                          removeItem={removeItem}
                          index={index}
                          availableLanguages={availableLanguages}
                          field={field}
                          onSave={onSave}
                          reorder={reorderAndRedraw}
                          size={fields.length}
                        />
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

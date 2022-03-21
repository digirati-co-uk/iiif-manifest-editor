import React from "react";
import { Button } from "../atoms/Button";
import { ShadowContainer } from "../atoms/ShadowContainer";
import { DeleteIcon } from "../icons/DeleteIcon";
import { FlexContainer } from "../layout/FlexContainer";
import { LanguageFieldEditor } from "./LanguageFieldEditor";

interface MetadataEditorProps {
  availableLanguages: string[];
  fields: any[];
  onSave: (data: any, index?: number, property?: "label" | "value") => void;
  removeItem: (index: number) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  availableLanguages,
  fields,
  onSave,
  removeItem,
}) => {
  return (
    <>
      {Array.isArray(fields) &&
        fields.map((field, index) => {
          return (
            <ShadowContainer>
              <FlexContainer style={{ justifyContent: "space-between" }}>
                <div>
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
                </div>
                <Button onClick={() => removeItem(index)}>
                  <DeleteIcon />
                </Button>
              </FlexContainer>
            </ShadowContainer>
          );
        })}
    </>
  );
};

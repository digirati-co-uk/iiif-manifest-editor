import React from "react";
import { ShadowContainer } from "../atoms/ShadowContainer";
import { LanguageFieldEditor } from "./LanguageFieldEditor";

interface MetadataEditorProps {
  availableLanguages: string[];
  fields: any[];
  onSave: (data: any, index?: number, property?: "label" | "value") => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  availableLanguages,
  fields,
  onSave,
}) => {
  return (
    <>
      {Array.isArray(fields) &&
        fields.map((field, index) => {
          return (
            <ShadowContainer>
              <LanguageFieldEditor
                label={""}
                fields={field.label}
                availableLanguages={availableLanguages}
                onSave={onSave}
                index={index}
                property={"label"}
              />
              <LanguageFieldEditor
                label={""}
                fields={field.value}
                availableLanguages={availableLanguages}
                onSave={onSave}
                index={index}
                property={"value"}
              />
            </ShadowContainer>
          );
        })}
    </>
  );
};

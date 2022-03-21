import React from "react";
import { ShadowContainer } from "../atoms/ShadowContainer";
import { LanguageFieldEditor } from "./LanguageFieldEditor";

interface MetadataEditorProps {
  availableLanguages: string[];
  fields: any[];
  onSave: (data: any) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  availableLanguages,
  fields,
  onSave,
}) => {
  return (
    <>
      {fields.map((field) => {
        return (
          <ShadowContainer>
            <LanguageFieldEditor
              label={""}
              fields={field.label}
              availableLanguages={availableLanguages}
              onSave={onSave}
            />
            <LanguageFieldEditor
              label={""}
              fields={field.value}
              availableLanguages={availableLanguages}
              onSave={onSave}
            />
          </ShadowContainer>
        );
      })}
    </>
  );
};

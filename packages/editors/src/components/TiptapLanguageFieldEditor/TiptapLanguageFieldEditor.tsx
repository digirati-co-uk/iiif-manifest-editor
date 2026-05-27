import { useConfig } from "@manifest-editor/shell";
import { useMemo } from "react";
import { flushSync } from "react-dom";
import { useDebounce } from "tiny-use-debounce";
import { type UseMetadataEditor, useMetadataEditor } from "../../hooks/useMetadataEditor";
import { InputGroup, InputLabel } from "../Input";
import { EmptyLanguageField } from "./TiptapLanguageFieldEditor.styles";
import { TiptapRichTextLanguageField } from "./TiptapRichTextLanguageField";

export interface TiptapLanguageFieldEditorProps extends UseMetadataEditor {
  label: string;
  index?: number;
  className?: string;
  containerId?: string;
  autoFocus?: boolean;
  property?: "label" | "value";
  focusId?: string;
  guidanceReference?: string;
  disableMultiline?: boolean;
  singleValue?: boolean;
  disallowHTML?: boolean;
}

export function TiptapLanguageFieldEditor(props: TiptapLanguageFieldEditorProps) {
  const { firstItem, createNewItem, fieldKeys, changeValue, getFieldByKey, changeLanguage, saveChanges } =
    useMetadataEditor(props);
  const debounceSave = useDebounce(saveChanges, 200);
  const {
    i18n: { availableLanguages },
  } = useConfig();

  const id = useMemo(() => `k-${Date.now()}`, []);
  const focusId = props.focusId ? props.focusId : id + props.metadataKey;

  const allFields = firstItem ? (
    <>
      {fieldKeys.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "5px",
            width: "100%",
            gap: "0.25em",
            marginBottom: "0.5em",
          }}
        >
          {fieldKeys.map((key, n) => {
            const field = getFieldByKey(key)!;
            const languages = [...availableLanguages];

            if (availableLanguages.indexOf(field.language) === -1) {
              languages.push(field.language);
            }

            if (availableLanguages.indexOf("none") === -1) {
              languages.unshift("none");
            }

            return (
              <InputGroup key={key} $active={fieldKeys.length > 1}>
                <TiptapRichTextLanguageField
                  autoFocus={n === 0 ? props.autoFocus : undefined}
                  disableMultiline={props.disableMultiline}
                  disallowHTML={props.disallowHTML}
                  id={n === 0 ? focusId : undefined}
                  language={field.language}
                  value={field.value}
                  languages={languages}
                  onBlur={() => {
                    saveChanges(props.index, props.property);
                  }}
                  onUpdateLanguage={(lang) => {
                    changeLanguage(key, lang);
                  }}
                  onUpdate={(value) => {
                    changeValue(key, value);
                    debounceSave(props.index, props.property);
                  }}
                />
              </InputGroup>
            );
          })}
        </div>
      )}
    </>
  ) : null;

  return (
    <div className={props.className || "mb-4"} id={props.containerId}>
      <InputLabel htmlFor={focusId}>{props.label}</InputLabel>
      {firstItem ? (
        allFields
      ) : (
        <EmptyLanguageField
          id={focusId}
          onClick={() => {
            flushSync(() => {
              createNewItem(false);
            });
            document.getElementById(focusId)?.focus();
          }}
        >
          Add value
        </EmptyLanguageField>
      )}
    </div>
  );
}

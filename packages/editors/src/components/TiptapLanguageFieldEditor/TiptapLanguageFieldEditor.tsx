import { ControlButton, OpaqueControls } from "@manifest-editor/components";
import { useConfig, useDecayState } from "@manifest-editor/shell";
import { SmallButton } from "@manifest-editor/ui/atoms/Button";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { useMemo, useState } from "react";
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
  const { firstItem, createNewItem, fieldKeys, changeValue, getFieldByKey, changeLanguage, saveChanges, removeItem } =
    useMetadataEditor(props);
  const debounceSave = useDebounce(saveChanges, 200);
  const [active, activeState] = useDecayState(2000);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const {
    i18n: { advancedLanguageMode, availableLanguages },
  } = useConfig();

  const isFullMode = advancedLanguageMode || fieldKeys.length > 1;
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
              <InputGroup
                key={key}
                $active={fieldKeys.length > 1}
                onMouseEnter={() => activeState.set()}
                onMouseLeave={() => activeState.clear(true)}
              >
                <TiptapRichTextLanguageField
                  autoFocus={n === 0 ? props.autoFocus : undefined}
                  disableMultiline={props.disableMultiline}
                  disallowHTML={props.disallowHTML}
                  id={n === 0 ? focusId : undefined}
                  language={field.language}
                  value={field.value}
                  languages={languages}
                  onFocus={() => {
                    activeState.set();
                  }}
                  onBlur={() => {
                    activeState.clear();
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
                {isReorderMode && fieldKeys.length > 0 ? (
                  <SmallButton
                    style={{ visibility: active ? "visible" : "hidden" }}
                    className="remove"
                    aria-label="remove"
                    onClick={() => {
                      removeItem(key);
                      saveChanges(props.index, props.property);
                    }}
                    title="delete"
                  >
                    <CloseIcon />
                  </SmallButton>
                ) : null}
              </InputGroup>
            );
          })}
        </div>
      )}

      {isFullMode && (!props.singleValue || fieldKeys.length > 1) ? (
        <OpaqueControls active={active}>
          <ControlButton aria-label="create new" onClick={() => createNewItem(true)}>
            Add another
          </ControlButton>

          <ControlButton aria-label="remove" onClick={() => setIsReorderMode((o) => !o)}>
            Remove
          </ControlButton>
        </OpaqueControls>
      ) : null}
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

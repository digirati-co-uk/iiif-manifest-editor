import React, { ChangeEvent, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useMetadataEditor, UseMetadataEditor } from "../../../hooks/useMetadataEditor";
import { SmallButton } from "../../../atoms/Button";
import { EmptyProperty } from "../../../atoms/EmptyProperty";
import { InformationLink } from "../../../atoms/InformationLink";
import { CloseIcon } from "../../../icons/CloseIcon";
import { FlexContainer, FlexContainerColumn } from "../../../components/layout/FlexContainer";
import { InputGroup, InputUnderlined } from "../../Input";
import { DropdownItem, StyledSelect } from "../../LanguageSelector";
import { useDebounce } from "tiny-use-debounce";
import { AddAnother, FormFieldWrapper, Label, EmptyLanguageField } from "./LanguageFieldEditor.styles";
import { useDecayState } from "../../../hooks/useDecayState";
import { flushSync } from "react-dom";
import Textarea from "react-textarea-autosize";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../../atoms/PaddingComponent";

export interface LanguageFieldEditorProps extends UseMetadataEditor {
  label: string;
  index?: number;
  property?: "label" | "value";
  focusId?: string;
  guidanceReference?: string;
  disableMultiline?: boolean;
}

export function LanguageFieldEditor(props: LanguageFieldEditorProps) {
  // This hook does the heavily lifting on the data side.
  const { firstItem, createNewItem, fieldKeys, changeValue, getFieldByKey, changeLanguage, saveChanges, removeItem } =
    useMetadataEditor(props);
  const debounceSave = useDebounce(saveChanges, 400);
  const [active, activeState] = useDecayState(2000);

  // We can set these up from config, or the browser or just allow them to be passed down.
  // This is where we choose a default for which languages will appear in the dropdown.
  // The `firstItem` will be based on the i18n of the user's browser.
  // ...
  const availableLanguages = props.availableLanguages || ["en", "none"];
  const guidanceReference = props.guidanceReference;
  const id = useMemo(() => `k-${Date.now()}`, []);

  // The hidden fields.
  const [showAllFields, setShowAllFields] = useState(true);
  const focusId = props.focusId ? props.focusId : id + props.metadataKey;
  const allFields =
    showAllFields && firstItem ? (
      <>
        {fieldKeys.length > 0 && (
          <div
            style={{
              // border: "1px solid lightgrey",
              display: "flex",
              flexDirection: "column",
              borderRadius: "5px",
              width: "100%",
            }}
          >
            {fieldKeys.map((key, n) => {
              const field = getFieldByKey(key);

              // We can avoid rendering the `firstItem` twice here.
              // This may not be desired in a popup (as in current madoc)
              // if (key === firstItem.id) {
              //   return null;
              // }

              const languages = [...availableLanguages];
              // Even if we don't have the language in the `availableLanguages` we
              // need to have the current language in the dropdown.
              if (availableLanguages.indexOf(field.language) === -1) {
                languages.push(field.language);
              }
              // We can also push on any fallbacks we might want always to be
              // available.
              if (availableLanguages.indexOf("none") === -1) {
                languages.unshift("none");
              }

              return (
                <InputGroup
                  key={key}
                  $active={fieldKeys.length > 1}
                  onMouseEnter={() => activeState.set()}
                  onMouseLeave={() => activeState.clear()}
                >
                  <InputUnderlined
                    as={props.disableMultiline ? "input" : Textarea}
                    type="text"
                    id={n === 0 ? focusId : undefined}
                    value={field.value}
                    onFocus={() => activeState.set()}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      changeValue(key, e.currentTarget.value);
                      debounceSave(props.index, props.property);
                    }}
                    onBlur={() => {
                      saveChanges(props.index, props.property);
                      activeState.clear();
                    }}
                  />
                  <StyledSelect
                    onFocus={() => activeState.set()}
                    onBlur={() => activeState.clear()}
                    value={field.language}
                    onChange={(e) => changeLanguage(key, e.currentTarget.value)}
                  >
                    {languages.map((lang) => (
                      <DropdownItem key={lang} value={lang}>
                        {lang}
                      </DropdownItem>
                    ))}
                  </StyledSelect>
                  {fieldKeys.length > 0 ? (
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
                  ) : (
                    <PaddingComponentMedium />
                  )}
                </InputGroup>
              );
            })}
          </div>
        )}

        <AddAnother $active={active}>
          {/* Here we can call createNewItem() with true, to indicate a new on existing */}
          <SmallButton aria-label="create-new" onClick={() => createNewItem(true)}>
            Add another
          </SmallButton>
        </AddAnother>
      </>
    ) : null;

  return (
    <FormFieldWrapper>
      <FlexContainer>
        <Label htmlFor={focusId}>{props.label}</Label>
        {guidanceReference && <InformationLink guidanceReference={guidanceReference} />}
      </FlexContainer>
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
    </FormFieldWrapper>
  );
}

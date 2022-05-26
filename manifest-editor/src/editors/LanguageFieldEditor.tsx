import React, { useState } from "react";
import { useMetadataEditor, UseMetadataEditor } from "../hooks/useMetadataEditor";
import { Button, SecondaryButton, SmallButton } from "../atoms/Button";
import { EmptyProperty } from "../atoms/EmptyProperty";
import { InformationLink } from "../atoms/InformationLink";
import { CloseIcon } from "../icons/CloseIcon";
import { FlexContainer, FlexContainerColumn } from "../components/layout/FlexContainer";
import { InputBorderless, InputGroup, InputWithDropdown } from "./Input";
import { DropdownItem, StyledSelect } from "./LanguageSelector";
import { useDebounce } from "tiny-use-debounce";
import { PaddingComponentSmall } from "../atoms/PaddingComponent";
import { shuffle } from "ionicons/icons";

export interface LanguageFieldEditorProps extends UseMetadataEditor {
  label: string;
  index?: number;
  property?: "label" | "value";
  guidanceReference?: string;
}

export function LanguageFieldEditor(props: LanguageFieldEditorProps) {
  // This hook does the heavily lifting on the data side.
  const { firstItem, createNewItem, fieldKeys, changeValue, getFieldByKey, changeLanguage, saveChanges, removeItem } =
    useMetadataEditor(props);
  const debounceSave = useDebounce(saveChanges, 400);

  // We can set these up from config, or the browser or just allow them to be passed down.
  // This is where we choose a default for which languages will appear in the dropdown.
  // The `firstItem` will be based on the i18n of the user's browser.
  // ...
  const availableLanguages = props.availableLanguages || ["en", "none"];
  const guidanceReference = props.guidanceReference;

  // The hidden fields.
  const [showAllFields, setShowAllFields] = useState(true);
  const allFields =
    showAllFields && firstItem ? (
      <FlexContainerColumn style={{ alignItems: "center" }}>
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
            {fieldKeys.map((key) => {
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
                <InputGroup key={key}>
                  {/* Reorderable tab will go here */}
                  <PaddingComponentSmall />
                  <InputWithDropdown
                    type="text"
                    id={key}
                    value={field.value}
                    onChange={(e) => {
                      changeValue(key, e.currentTarget.value);
                      debounceSave(props.index, props.property);
                    }}
                    onBlur={() => {
                      saveChanges(props.index, props.property);
                    }}
                  />
                  <StyledSelect value={field.language} onChange={(e) => changeLanguage(key, e.currentTarget.value)}>
                    {languages.map((lang) => (
                      <DropdownItem key={lang} value={lang}>
                        {lang}
                      </DropdownItem>
                    ))}
                  </StyledSelect>
                  <SmallButton
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
                </InputGroup>
              );
            })}
          </div>
        )}
        {/* Here we can call createNewItem() with true, to indicate a new on existing */}
        <SmallButton aria-label="create-new" onClick={() => createNewItem(true)}>
          Add another
        </SmallButton>
        <br />
      </FlexContainerColumn>
    ) : null;

  if (!firstItem) {
    // Case 1 - we have a completely empty value.
    // { en: [] }
    // Although technically invalid, we still need to support it.
    // We could either create an empty value automatically, or, as in this case give that
    // information to the user and propmt to add a new one.
    return (
      <EmptyProperty label={props.label} createNew={() => createNewItem(false)} guidanceReference={guidanceReference} />
    );
  }

  return (
    <div style={{ width: "100%}" }}>
      <FlexContainer>
        <h4>{props.label}</h4>
        {guidanceReference && <InformationLink guidanceReference={guidanceReference} />}
      </FlexContainer>
      <div>{allFields}</div>
    </div>
  );
}

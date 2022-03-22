import React, { useState } from "react";
import {
  useMetadataEditor,
  UseMetadataEditor,
} from "../../hooks/useMetadataEditor";
import { Button, CalltoButton } from "../atoms/Button";
import { DeleteIcon } from "../icons/DeleteIcon";
import { FlexContainer } from "../layout/FlexContainer";
import { Input } from "./Input";
import { DropdownItem, StyledSelect } from "./LanguageSelector";

export interface LanguageFieldEditorProps extends UseMetadataEditor {
  label: string;
  index?: number;
  property?: "label" | "value";
}

export function LanguageFieldEditor(props: LanguageFieldEditorProps) {
  // This hook does the heavily lifting on the data side.
  const {
    firstItem,
    createNewItem,
    fieldKeys,
    changeValue,
    getFieldByKey,
    changeLanguage,
    saveChanges,
    removeItem,
  } = useMetadataEditor(props);

  // We can set these up from config, or the browser or just allow them to be passed down.
  // This is where we choose a default for which languages will appear in the dropdown.
  // The `firstItem` will be based on the i18n of the user's browser.
  // ...
  const availableLanguages = props.availableLanguages || ["en", "none"];

  // The hidden fields.
  const [showAllFields, setShowAllFields] = useState(false);
  const allFields =
    showAllFields && firstItem ? (
      <div>
        {fieldKeys.map((key) => {
          const field = getFieldByKey(key);

          // We can avoid rendering the `firstItem` twice here.
          // This may not be desired in a popup (as in current madoc)
          if (key === firstItem.id) {
            return null;
          }

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
            <FlexContainer key={key}>
              <Button onClick={() => removeItem(key)}>
                <DeleteIcon />
              </Button>
              <Input
                type="text"
                id={key}
                value={field.value}
                onChange={(e) => changeValue(key, e.currentTarget.value)}
              />
              <StyledSelect
                value={field.language}
                onChange={(e) => changeLanguage(key, e.currentTarget.value)}
              >
                {languages.map((lang) => (
                  <DropdownItem key={lang} value={lang}>
                    {lang}
                  </DropdownItem>
                ))}
              </StyledSelect>
            </FlexContainer>
          );
        })}
        {/* Here we can call createNewItem() with true, to indicate a new on existing */}
        <CalltoButton onClick={() => createNewItem(true)}>
          Add new value
        </CalltoButton>
        <hr />
        <FlexContainer style={{ justifyContent: "flex-end" }}>
          <CalltoButton
            onClick={() => {
              setShowAllFields(false);
              saveChanges(props.index, props.property);
            }}
          >
            Save changes to {props.label}
          </CalltoButton>
        </FlexContainer>
      </div>
    ) : null;

  if (!firstItem) {
    // Case 1 - we have a completely empty value.
    // { en: [] }
    // Although technically invalid, we still need to support it.
    // We could either create an empty value automatically, or, as in this case give that
    // information to the user and propmt to add a new one.
    return (
      <div>
        {props.label}
        <CalltoButton onClick={() => createNewItem(false)}>Create</CalltoButton>
      </div>
    );
  }

  // Our default text box, we are provided with `firstItem` which is enough for
  // out on change event. For other resources we need to know what this "id" is.
  const defaultTextBox = (
    <FlexContainer>
      <Input
        type="text"
        value={firstItem.field.value}
        onChange={(e) => changeValue(firstItem.id, e.currentTarget.value)}
        onBlur={() => {
          // Saving is slightly intensive, this is a sort of semi-controlled
          // input, we will call onChange to the component using this component
          // but not after every character. Here I've set it on blur of the
          // first text box and also when you "close" the expanded view.
          saveChanges(props.index, props.property);
        }}
      />
      <CalltoButton
        onClick={() => setShowAllFields(true)}
        disabled={showAllFields}
      >
        {`(${firstItem.field.language}${
          fieldKeys.length > 1 ? `+ ${fieldKeys.length - 1}` : ""
        })`}
      </CalltoButton>
    </FlexContainer>
  );

  return (
    <div
      style={{
        border: showAllFields ? "1px solid grey" : "none",
        borderRadius: showAllFields ? "5px" : "none",
      }}
    >
      <div>{props.label}</div>
      <div>{defaultTextBox}</div>
      <div>{allFields}</div>
    </div>
  );
}

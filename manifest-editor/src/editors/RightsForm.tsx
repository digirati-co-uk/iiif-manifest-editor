import React from "react";
import { SmallButton } from "@/atoms/Button";
import { InputContainer, InputLabel } from "./Input";
import { SelectSearchField } from "@/_components/form-elements/SelectSearchField/SelectSearchField";

export const RightsForm: React.FC<{
  options: string[] | null;
  label: string;
  selected: string | string[] | null;
  changeHandler: (value: any) => void;
  multi?: boolean;
  guidanceReference?: string;
}> = ({ options, label, selected, changeHandler, multi = true, guidanceReference }) => {
  if (!options) {
    return null;
  }

  return (
    <InputContainer wide>
      <InputLabel $margin htmlFor="rights">
        {label}
      </InputLabel>
      <SelectSearchField
        id="rights"
        // multiple={multi} @todo come back to this.
        defaultValue={(selected || undefined) as any}
        onChange={(selectedValue) => changeHandler(selectedValue)}
        options={options.map((opt) => ({ name: opt, value: opt }))}
      />
      <div style={{ margin: "0.5em 0" }}>
        <SmallButton aria-label="Clear rights" onClick={() => changeHandler(undefined)}>
          Clear value
        </SmallButton>
      </div>
    </InputContainer>
  );
};

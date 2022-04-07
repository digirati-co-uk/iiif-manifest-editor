import { useState } from "react";
import { Button, ButtonGroup } from "../atoms/Button";
import { Dropdown, DropdownContent } from "../atoms/Dropdown";
import { DropdownContainer, MenuContainer } from "../atoms/DropdownPreviewMenu";
import { InformationLink } from "../atoms/InformationLink";
import { VerticalDivider } from "../atoms/VerticalDivider";
import { AddIcon } from "../icons/AddIcon";
import { CheckIcon } from "../icons/CheckIcon";
import { DownIcon } from "../icons/DownIcon";
import { FlexContainer } from "../layout/FlexContainer";
import { HiddenCheckbox, InputLabel, MutliselectLabel } from "./Input";

export const RightsForm: React.FC<{
  options: string[] | null;
  label: string;
  selected: string | string[] | null;
  changeHandler: (value: string) => void;
  multi?: boolean;
  guidanceReference?: string;
}> = ({
  options,
  label,
  selected,
  changeHandler,
  multi = true,
  guidanceReference,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MenuContainer style={{ width: "100%" }}>
        <InputLabel>{label}</InputLabel>

        <FlexContainer
          style={{ width: "100%", justifyContent: "space-between" }}
          onClick={() => setOpen(!open)}
        >
          <div>{selected}</div>
          <Button onClick={() => setOpen(!open)}>
            <VerticalDivider />
            <DownIcon />
          </Button>
        </FlexContainer>

        {open && (
          <DropdownContainer
            style={{ width: "100%" }}
            onMouseLeave={() => setOpen(false)}
          >
            <DropdownContent style={{ flexWrap: "wrap", width: "100%" }}>
              {options &&
                options.map((choice) => {
                  return (
                    <MutliselectLabel $selected={selected?.includes(choice)}>
                      {choice}
                      {selected?.includes(choice) && multi ? (
                        <CheckIcon />
                      ) : (
                        multi && <AddIcon />
                      )}
                      {selected?.includes(choice) && !multi && <CheckIcon />}
                      <HiddenCheckbox
                        type={multi ? "checkbox" : "radio"}
                        checked={selected?.includes(choice)}
                        onChange={() => changeHandler(choice)}
                      />
                    </MutliselectLabel>
                  );
                })}
            </DropdownContent>
          </DropdownContainer>
        )}
        {guidanceReference && (
          <InformationLink guidanceReference={guidanceReference} />
        )}
      </MenuContainer>
    </>
  );
};

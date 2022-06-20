import { useState } from "react";
import { Button } from "../atoms/Button";
import { DropdownContent } from "../atoms/Dropdown";
import { DropdownContainer, MenuContainer } from "../atoms/DropdownPreviewMenu";
import { InformationLink } from "../atoms/InformationLink";
import { VerticalDivider } from "../atoms/VerticalDivider";
import { AddIcon } from "../icons/AddIcon";
import { CheckIcon } from "../icons/CheckIcon";
import { DownIcon } from "../icons/DownIcon";
import { FlexContainer } from "../components/layout/FlexContainer";
import { HiddenCheckbox, MutliselectLabel } from "./Input";
import { PaddingComponentMedium } from "../atoms/PaddingComponent";

export const RightsForm: React.FC<{
  options: string[] | null;
  label: string;
  selected: string | string[] | null;
  changeHandler: (value: string) => void;
  multi?: boolean;
  guidanceReference?: string;
}> = ({ options, label, selected, changeHandler, multi = true, guidanceReference }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MenuContainer style={{ width: "100%" }}>
        <FlexContainer>
          <h4>{label}</h4>
          {guidanceReference && <InformationLink guidanceReference={guidanceReference} />}
        </FlexContainer>
        <FlexContainer>
          <FlexContainer style={{ background: "#eee" }} onClick={() => setOpen(!open)}>
            <div>{selected}</div>
            <Button
              aria-label="open/close"
              onClick={() => setOpen(!open)}
              style={{ border: "0.5px solid lightgrey", borderRadius: "0 5px 5px 0", width: "4rem", height: "3rem" }}
            >
              <DownIcon />
            </Button>
          </FlexContainer>
          <PaddingComponentMedium style={{ backgroundColor: "white" }} />
        </FlexContainer>

        {open && (
          <DropdownContainer style={{ width: "100%" }} onMouseLeave={() => setOpen(false)}>
            <DropdownContent style={{ flexWrap: "wrap", width: "100%" }}>
              {options &&
                options.map((choice) => {
                  return (
                    <MutliselectLabel $selected={selected?.includes(choice)}>
                      {choice}
                      {selected?.includes(choice) && multi ? <CheckIcon /> : multi && <AddIcon />}
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
        <PaddingComponentMedium />
      </MenuContainer>
    </>
  );
};

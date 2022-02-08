import { useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";
import { FlexContainerColumn } from "../layout/FlexContainer";

export const DropdownItem = styled.div`
   {
    padding: 0.12em;
    margin: 0.12em;
    color: ${(props: any) => props.color || "none"};
    border: none;
    cursor: pointer;
  }
`;

const DropdownContainer = styled(FlexContainerColumn)`
  position: relative;
`;

type DropdownOption = {
  label: any;
}

export const DropdownMenu: React.FC<{ label: string; options: Array<DropdownOption> }> = ({
  label,
  options
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button style={{ height: "90%" }} onClick={() => setOpen(!open)}>
        {label}
      </Button>
      {open ? (
        <DropdownContainer justify={"flex-start"}>
          {options.map((option: DropdownOption) => {
            return (
              <DropdownItem>{option.label}</DropdownItem>
            );
          })}
        </DropdownContainer>
      ) : (
        <></>
      )}
    </div>
  );
};

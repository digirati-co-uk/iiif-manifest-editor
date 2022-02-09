import { useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";
import { FlexContainerColumn } from "../layout/FlexContainer";
import { PreviewIcon } from "../icons/Preview";

export const DropdownItem = styled.div`
   {
    padding: 0.12em;
    margin: 0.12em;
    color: ${(props: any) => props.color || "none"};
    border: none;
    cursor: pointer;
    display: block;
    right: 0;
    &:hover {
      background-color: lightgrey;
    }
  }
`;

const DropdownContainer = styled(FlexContainerColumn)`
  display: flex;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  z-index: 1;
  right: 0;
`;

type DropdownOption = {
  label: any;
};

const PreviewButton = styled.div`
  display: flex;
  justify-content: flex-end;
  alignitems: center;
`;

const MenuContainer = styled.div`
  display: inline-block;
  position: relative;
`;

export const DropdownMenu: React.FC<{
  label: string;
  options: Array<DropdownOption>;
  onClick: () => Promise<void>;
  selectedPreviewIndex: number;
}> = ({ label, options, onClick, selectedPreviewIndex }) => {
  const [open, setOpen] = useState(false);
  return (
    <MenuContainer>
      <PreviewButton onClick={onClick}>
        <Button
          style={{
            height: "90%",
            display: "flex",
            alignItems: "center"
          }}
          onClick={() => setOpen(!open)}
        >
          <PreviewIcon />
          {label}
        </Button>
      </PreviewButton>
      {open ? (
        <DropdownContainer justify={"flex-end"}>
          {options.map((option: DropdownOption) => {
            return <DropdownItem>{option.label}</DropdownItem>;
          })}
        </DropdownContainer>
      ) : (
        <></>
      )}
    </MenuContainer>
  );
};

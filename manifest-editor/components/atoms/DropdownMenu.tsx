import { useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";
import { FlexContainerColumn } from "../layout/FlexContainer";
import { PreviewIcon } from "../icons/Preview";
import { DownIcon } from "../icons/DownIcon";
import { VerticalDivider } from "./VerticalDivider";

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
  z-index: 13;
  right: 0;
`;

type DropdownOption = {
  label: any;
};

const Outline = styled.div`
  border: 0.0375rem solid grey;
  border-radius: 0.0375rem;
  display: flex;
  align-items: center;
  height: 100%;
`;

const PreviewButton = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  text-align: right;
  justify-content: flex-end;
  padding: none;
`;

const MenuContainer = styled.div`
  display: inline-block;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  height: 2rem;
`;

export const DropdownMenu: React.FC<{
  label: string | JSX.Element;
  options: Array<DropdownOption>;
  onPreviewClick: () => Promise<void>;
  setSelectedPreviewIndex: (index: number) => void;
  previewUrl: string;
  showAgain: boolean;
}> = ({
  label,
  options,
  onPreviewClick,
  setSelectedPreviewIndex,
  previewUrl,
  showAgain
}) => {
  const [open, setOpen] = useState(false);

  const clickHandler = (index: number) => {
    setOpen(!open);
    setSelectedPreviewIndex(index);
    if (showAgain) {
      onPreviewClick();
    }
  };
  return (
    <MenuContainer>
      <PreviewButton>
        <Outline>
          <Button
            style={{
              height: "90%",
              display: "flex",
              alignItems: "center"
            }}
            onClick={onPreviewClick}
          >
            <PreviewIcon />
            {label}
          </Button>
          <Button
            style={{
              height: "90%",
              display: "flex",
              alignItems: "center"
            }}
            onClick={() => setOpen(!open)}
          >
            <VerticalDivider />
            <DownIcon />
          </Button>
        </Outline>
      </PreviewButton>
      {open ? (
        <DropdownContainer justify={"flex-end"}>
          {options.map((option: DropdownOption, index: number) => {
            return (
              <DropdownItem onClick={() => clickHandler(index)}>
                {showAgain ? (
                  option.label
                ) : (
                  <a href={previewUrl} target={"_blank"} rel="noreferrer">
                    {option.label}
                  </a>
                )}
              </DropdownItem>
            );
          })}
        </DropdownContainer>
      ) : (
        <></>
      )}
    </MenuContainer>
  );
};

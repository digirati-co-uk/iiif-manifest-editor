import { useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";
import { FlexContainerColumn } from "../layout/FlexContainer";
import { PreviewIcon } from "../icons/Preview";
import { DownIcon } from "../icons/DownIcon";
import { VerticalDivider } from "./VerticalDivider";

export const DropdownItem = styled.div`
   {
    padding: ${(props: any) => props.theme.padding.small || "1rem"};
    color: ${(props: any) => props.theme.color.main || "none"};
    border: none;
    cursor: pointer;
    display: block;
    right: 0;
    &:hover {
      background-color: ${(props: any) =>
        props.theme.color.lightgrey || "lightgrey"};
    }
  }
`;

const DropdownContainer = styled(FlexContainerColumn)`
  display: flex;
  position: absolute;
  background-color: ${(props: any) => props.theme.color.white || "none"};
  min-width: 100%;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 13;
  right: 0;
`;

type DropdownOption = {
  label: any;
};

const Outline = styled.div`
  border: 0.031rem solid grey;
  border-radius: 0.25rem;
  display: flex;
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  align-items: center;
`;

const MenuContainer = styled.div`
  display: inline-block;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  height: 2rem;
`;

export const DropdownPreviewMenu: React.FC<{
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
  showAgain,
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
      <Outline>
        <Button onClick={onPreviewClick}>
          <PreviewIcon />
          {label}
        </Button>
        <Button onClick={() => setOpen(!open)}>
          <VerticalDivider />
          <DownIcon />
        </Button>
      </Outline>
      {open ? (
        <DropdownContainer
          justify={"flex-end"}
          onMouseLeave={() => setOpen(!open)}
        >
          {options.map((option: DropdownOption, index: number) => {
            return (
              <DropdownItem onClick={() => clickHandler(index)} key={index}>
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

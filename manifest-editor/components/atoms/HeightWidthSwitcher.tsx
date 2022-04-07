import { useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";
import { FlexContainerColumn } from "../layout/FlexContainer";
import { DownIcon } from "../icons/DownIcon";

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
  bottom: 0;
`;

export type ThumbnailSize = {
  w: number;
  h: number;
};

const Outline = styled.div`
  display: flex;
  align-items: center;
  padding: ${(props: any) => props.theme.padding.small || "1rem"};
  background-color: ${(props: any) => props.theme.color.lightgrey || "grey"};
  border-bottom: 2px solid
    ${(props: any) => props.theme.color.mediumgrey || "grey"};
`;

const MenuContainer = styled.div`
  justify-content: flex-end;
  align-items: center;
  position: relative;
  height: 2rem;
`;

export const HeightWidthSwitcher: React.FC<{
  label: string;
  options: Array<ThumbnailSize>;
  onOptionClick: (option: ThumbnailSize) => void | undefined;
}> = ({ label, options, onOptionClick }) => {
  const [open, setOpen] = useState(false);

  const clickHandler = (option: ThumbnailSize) => {
    setOpen(!open);
    onOptionClick(option);
  };
  return (
    <MenuContainer>
      {open ? (
        <DropdownContainer
          justify={"flex-end"}
          onMouseLeave={() => setOpen(!open)}
        >
          {options.map((option: ThumbnailSize, index: number) => {
            return (
              <DropdownItem onClick={() => clickHandler(option)} key={index}>
                <small>{`${option.w}x${option.h}`}</small>
              </DropdownItem>
            );
          })}
        </DropdownContainer>
      ) : (
        <></>
      )}
      <Outline onClick={() => setOpen(!open)}>
        {label}
        <DownIcon />
      </Outline>
    </MenuContainer>
  );
};

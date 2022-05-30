import styled, { css } from "styled-components";
import { Button } from "./Button";

export const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownContent = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  background-color: ${(props: any) => props.theme.color.white || "white"};
  color: ${(props: any) => props.theme.color.black || " black"};
  font-size: 0.75rem;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 150;
  button {
    &:hover {
      background-color: ${(props: any) => props.theme.color.lightgrey || "lightgrey"};
    }
  }
`;

export const DropdownMenu = styled.div<{ $open?: boolean }>`
  display: none;
  flex-direction: column;
  position: absolute;
  background: #fff;
  color: ${(props: any) => props.theme.color.black || " black"};
  font-size: 0.75rem;
  min-width: 160px;
  top: calc(100% + 0.5em);
  box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.18), 0 0px 0px 1px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  z-index: 150;

  ${Button} {
    &:hover {
      background-color: ${(props: any) => props.theme.color.lightgrey || "lightgrey"};
    }
  }

  ${(props) =>
    props.$open &&
    css`
      display: flex;
    `}
`;

export const DropdownLabel = styled.div`
  color: #999;
  text-transform: uppercase;
  font-weight: 600;
  padding: 0.7em;
  font-size: 0.875em;
`;

export const DropdownDivider = styled.div`
  height: 1px;
  margin: 0 0.5em;
  background: #eee;
`;

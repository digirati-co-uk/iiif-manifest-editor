import styled, { css } from "styled-components";
import { ButtonReset } from "@manifest-editor/ui/atoms/Button";

export const ButtonContainer = styled.div`
  display: flex;
  position: relative;
  width: 10em;
`;

const variation = {
  light: {
    bg: { normal: "#fff", hover: "#f8f5fe", active: "#f8f5fe" },
    border: { main: "", divider: "" },
    color: "",
  },
  salmon: {
    bg: { normal: "salmon", hover: "#ff988e", active: "#ff988e" },
    border: { main: "salmon", divider: "#e37266" },
    color: "",
  },
};

export const ButtonMain = styled(ButtonReset as any)`
  flex: 1;
  padding: 0.6em 0.8em;
  background: salmon;
  color: #fff;
  border-top-left-radius: 5px;
  font-size: 0.875em;
  border-bottom-left-radius: 5px;
  border: 1px solid salmon;
  border-right-width: 0;

  &:hover {
    color: #fff;
    background: #ff988e;
  }

  &:active {
    background: #ff988e;
    box-shadow: inset 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }
`;

export const ButtonChange = styled(ButtonReset as any)<{ $open: boolean }>`
  background: salmon;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px solid salmon;
  border-left: 1px solid #e37266;
  padding: 0.4em;
  color: #fff;
  svg {
    fill: currentColor;
  }
  &:hover {
    color: #fff;
    background: #ff988e;
  }

  &:active {
    background: #ff988e;
    box-shadow: inset 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }

  ${(props) =>
    props.$open &&
    css`
      background: #ff988e;
      box-shadow: inset 0 2px 8px 0 rgba(0, 0, 0, 0.15);
    `}
`;

export const MenuContainer = styled.div<{ $open: boolean }>`
  position: absolute;
  opacity: 0;
  top: 100%;
  margin-top: 0.3em;
  border-radius: 3px;
  left: -50%;
  width: 150%;
  pointer-events: none;
  box-shadow:
    0 4px 15px 0 rgba(0, 0, 0, 0.18),
    0 0px 0px 1px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  background: #fff;
  overflow: hidden;

  ${(props) =>
    props.$open &&
    css`
      opacity: 1;
      pointer-events: visible;
    `}
`;

export const MenuItem = styled.div`
  display: flex;
  background: #fff;
  padding: 0.4em;
  align-items: center;

  &:hover {
    background: #f9f9f9;
  }
`;

const statusMap = {
  available: "#ddd",
  configured: "#e37266",
  active: "#4cb235",
};

export const MenuItemStatus = styled.div<{ $status: "available" | "configured" | "active" }>`
  margin: 0.2em 0.5em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => statusMap[props.$status]};
`;

export const MenuItemLabel = styled.div`
  flex: 1;
  font-size: 0.925em;
  padding: 0.2em;
  text-overflow: ellipsis;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
`;

export const MenuItemClose = styled.div`
  background: #f9f9f9;
  font-size: 0.8em;
`;

export const ButtonEmpty = styled.div`
  color: #999;
  font-size: 0.8em;
  padding: 0.6em 0.8em;
  border: 2px dashed #f9f9f9;
  border-radius: 5px;
  user-select: none;
  cursor: not-allowed;
`;

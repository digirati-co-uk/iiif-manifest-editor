import styled, { css, keyframes } from "styled-components";
import { MenuPositions } from "./Layout.types";
import { TransitionStatus } from "react-transition-group";

export const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const Header = styled.header`
  //box-shadow: 0 3px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 0 0 rgba(0, 0, 0, 0.17);
  z-index: 200;
`;

export const Footer = styled.div`
  background: #fff;
`;

export const Main = styled.div`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
`;

export const LeftPanel = styled.div<{ $state?: TransitionStatus; $width: string; $motion?: boolean }>`
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 720px;
  align-items: flex-end;

  ${(props) =>
    props.$motion
      ? css`
          transition: max-width 400ms;
        `
      : ""}

  ${(props) => {
    switch (props.$state) {
      case "entering":
        return css`
          max-width: ${props.$width};
        `;
      case "exiting":
        return css`
          max-width: 0;
        `;
      case "unmounted":
      case "exited":
        return css`
          max-width: 0;
        `;
    }
  }}
`;

export const CenterPanel = styled.div`
  flex: 1 1 0;
  background: #e3e7f0;
  // background: #efefef;
  box-shadow: inset 0 3px 2px 0 rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(0, 0, 0, 0.14);
  padding-top: 1px;
  // background: linear-gradient(0deg, rgba(251, 242, 237, 1) 0%, rgba(240, 229, 245, 1) 50%, rgba(236, 245, 255, 1) 100%);

  min-width: 320px;
  display: flex;

  min-height: 0;
  overflow: hidden;

  > * {
    min-width: 0;
  }
`;

export const RightPanel = styled.div<{ $state?: TransitionStatus; $width: string; $motion?: boolean }>`
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 720px;

  ${(props) => (props.$motion ? "transition: max-width 400ms;" : "")}

  ${(props) => {
    switch (props.$state) {
      case "entering":
        return css`
          max-width: ${props.$width};
        `;
      case "exiting":
        return css`
          max-width: 0;
        `;
      case "unmounted":
      case "exited":
        return css`
          max-width: 0;
        `;
    }
  }}
`;

export const PanelContainer = styled.div<{ $menu?: MenuPositions }>`
  display: flex;
  flex: 1;
  height: 100%;
  min-width: 50px;
  transition: min-width 400ms;
  overflow: hidden;

  ${(props) => {
    switch (props.$menu) {
      case "top":
        return css`
          flex-direction: column;
          ${PanelMenu} {
            flex-direction: column;
          }
        `;
      case "left":
        return css`
          flex-direction: row;
          ${PanelMenu} {
            flex-direction: row;
          }
        `;
      default:
      case "bottom":
        return css`
          flex-direction: column-reverse;
          ${PanelMenu} {
            flex-direction: column;
          }
        `;
      case "right":
        return css`
          flex-direction: row-reverse;
          ${PanelMenu} {
            flex-direction: row;
          }
        `;
    }
  }}
`;

export const PanelMenu = styled.div<{ $position: "bottom" | "top" | "left" | "right"; $open: boolean }>`
  display: flex;
  box-shadow: 0 -3px 2px 0 rgba(0, 0, 0, 0.04), 0 -1px 0 0 rgba(0, 0, 0, 0.17);

  ${(props) =>
    !props.$open && (props.$position === "top" || props.$position === "bottom")
      ? css`
          display: none;
        `
      : ""}
`;

export const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

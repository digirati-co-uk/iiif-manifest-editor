import styled, { css } from "styled-components";
import { MenuPositions } from "./Layout.types";

export const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Header = styled.header`
  box-shadow: 0 3px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 0 0 rgba(0, 0, 0, 0.17);
  z-index: 11;
`;

export const Footer = styled.div`
  background: #fff;
`;

export const Main = styled.div`
  display: flex;
  flex: 1 1 0;
`;

export const LeftPanel = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
`;

export const CenterPanel = styled.div`
  flex: 1 1 0;
  //background: #efefef;
  background: linear-gradient(0deg, rgba(251, 242, 237, 1) 0%, rgba(240, 229, 245, 1) 50%, rgba(236, 245, 255, 1) 100%);

  min-width: 320px;
`;

export const RightPanel = styled.div`
  background: #fff;
`;

export const PanelContainer = styled.div<{ $menu?: MenuPositions }>`
  display: flex;
  flex: 1;
  height: 100%;

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
          background: red;
          display: none;
        `
      : ""}
`;

export const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

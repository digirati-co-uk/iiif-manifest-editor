import styled, { css } from "styled-components";

export const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Header = styled.header`
  box-shadow: 0 3px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 0 0 rgba(0, 0, 0, 0.17);
  z-index: 1;
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
`;

export const CenterPanel = styled.div`
  flex: 1 1 0;
  background: #efefef;
`;

export const RightPanel = styled.div`
  background: #fff;
`;

export const RightPanelHandle = styled.div`
  background: bisque;
  width: 20px;
`;

export const LeftPanelHandle = styled.div`
  background: bisque;
  width: 20px;
`;

// Panel inners

export const PanelContainer = styled.div<{ $menu?: "left" | "right" | "bottom" | "top" }>`
  display: flex;

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

export const PanelMenu = styled.div`
  display: flex;
  background: green;
`;

export const PanelContent = styled.div``;

// Panel Content Transitions
// - Slide left (left panel)
// - Slide right (right panel)
// - Slide up/down (show/hide)
//
// Inner transitions (state -> state)
// - Slide left
// - Slide right
// - Fade

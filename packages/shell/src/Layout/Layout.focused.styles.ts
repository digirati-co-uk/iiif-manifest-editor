import styled, { css } from "styled-components";

export const Main = styled.div`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
`;

export const CenterPanel = styled.div`
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  background: #e3e7f0;
  padding-top: 1px;
  overflow: hidden;

  > * {
    min-width: 0;
  }
`;

export const LoadingCenter = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const PanelSwitcher = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  top: 1rem;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);

  ${(props) =>
    props.$side === "left"
      ? css`
          left: 1rem;
        `
      : css`
          right: 1rem;
        `}
`;

export const PanelSwitchButton = styled.button`
  width: 2.35rem;
  height: 2.35rem;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    background: #f2f3f6;
    color: #111827;
  }

  &[data-selected="true"] {
    background: #b84c74;
    color: #fff;
  }

  svg {
    width: 1.25em;
    height: 1.25em;
  }
`;

export const PanelSwitchGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const PanelSwitchDivider = styled.div`
  width: 100%;
  height: 1px;
  margin: 0.25rem 0;
  background: rgba(15, 23, 42, 0.14);
`;

export const FloatingPanel = styled.aside<{
  $side: "left" | "right";
  $open: boolean;
}>`
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  z-index: 35;
  display: flex;
  min-width: min(320px, calc(100vw - 2rem));
  max-width: min(720px, calc(100vw - 2rem));
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 6px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
  overflow: hidden;
  opacity: ${(props) => (props.$open ? 1 : 0)};
  pointer-events: ${(props) => (props.$open ? "auto" : "none")};
  transition:
    opacity 180ms ease,
    transform 180ms ease;

  ${(props) =>
    props.$side === "left"
      ? css`
          left: 4.5rem;
          transform: translateX(${props.$open ? "0" : "-0.75rem"});
        `
      : css`
          right: 4.5rem;
          transform: translateX(${props.$open ? "0" : "0.75rem"});
        `}

  @media (max-width: 760px) {
    top: 4.25rem;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    width: auto !important;
    max-width: none;
    min-width: 0;
    transform: translateY(${(props) => (props.$open ? "0" : "0.75rem")});
  }
`;

export const FloatingPanelBody = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
`;

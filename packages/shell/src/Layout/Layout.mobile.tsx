import styled, { css } from "styled-components";
import { ModularPanelHeader } from "../Layout/components/ModularPanel";

export const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
  flex-direction: column;
`;

export const CenterPanel = styled.div`
  flex: 1;
  position: relative;
  z-index: 7;
`;

export const MobileBar = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #cbcbcb;
  padding: 0.5rem;
  min-height: 4rem;
  z-index: 9;
`;

export const LeftBarButton = styled.button`
  flex: 1;
  min-width: 0;
  padding: 0.75rem 1rem;
  border-radius: 5px;
  border: 1px solid #979797;
  background: #ffffff;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DrawerContainer = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
`;

export const DrawerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border-radius: 5px;
  border: 1px solid #979797;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    flex: 0 0 auto;
    font-size: 1.25em;
  }
`;

export const DrawerBody = styled.div<{ $open?: boolean }>`
  background: #fff;
  display: flex;
  position: absolute;
  transform: translateX(100%);
  overflow-y: auto;
  left: auto;
  right: 0;
  top: 4rem;
  width: min(100%, 480px);
  z-index: 10;
  box-shadow:
    -5px 0 15px 0 rgba(0, 0, 0, 0),
    -3px 0 5px 0 rgba(0, 0, 0, 0);
  bottom: 0;
  transition:
    0.3s transform ease-in-out,
    0.3s box-shadow;
  ${(props) =>
    props.$open &&
    css`
      box-shadow:
        -5px 0 15px 0 rgba(0, 0, 0, 0.1),
        -3px 0 5px 0 rgba(0, 0, 0, 0.1);
      transform: translateX(0);
    `}

  ${ModularPanelHeader} {
    box-shadow: none;
    padding-left: 0.5em;
    padding-right: 0.5em;
    font-size: 1.1em;
  }
`;

export const LeftPanel = styled.div<{ $open?: boolean }>`
  display: flex;
  flex-direction: column;
  position: absolute;
  transform: translateX(-100%);
  background: #fff;
  left: 0;
  top: 4rem;
  bottom: 0;
  width: min(90%, 420px);
  z-index: 10;
  overflow: hidden;
  transition: 0.5s transform;
  ${(props) =>
    props.$open &&
    css`
      transform: translateX(0);
    `}
`;

export const Lightbox = styled.button<{ $open?: boolean }>`
  border: 0;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: none;
  position: absolute;
  z-index: 8;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.5s;

  ${(props) =>
    props.$open &&
    css`
      pointer-events: visible;
      opacity: 1;
    `}
`;

import styled, { css } from "styled-components";

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
  justify-content: space-around;
  width: 100%;
  background: #fff;
  border-top: 1px solid #cbcbcb;
  padding: 0.5em;
  height: 3.4rem;
`;

export const LeftBarButton = styled.button`
  //background: red;
  padding: 0.5em 1em;
  width: 32%;

  border-radius: 5px;
  border: none;
  background: #ffffff;
`;

export const PreviewBarButton = styled.button`
  padding: 0.5em 1em;
  width: 32%;

  border-radius: 5px;

  background: #5e59c2;
  border: 1px solid rgba(0, 0, 0, 0.21);
  color: #ffffff;
`;

export const DrawerContainer = styled.div`
  position: relative;
  width: 32%;
  margin: 0 0.75em;
  z-index: 9;
`;

export const DrawerButton = styled.button`
  padding: 0.4em 1em 0.65em;
  position: absolute;
  width: 100%;
  bottom: 1em;
  background: #ffffff;
  box-shadow: 0 3px 18px 0 rgba(0, 0, 0, 0.04);
  border-radius: 5px;
  border: 1px solid #979797;
  letter-spacing: -0.46px;

  svg {
    display: block;
    margin: auto;
    font-size: 1.8em;
  }
`;

export const DrawerBody = styled.div<{ $open?: boolean }>`
  background: #fff;
  display: flex;
  position: absolute;
  transform: translateY(100%);
  overflow-y: auto;
  left: 0;
  right: 0;
  top: 7em;
  z-index: 10;
  box-shadow: 0 -5px 15px 0 rgba(0, 0, 0, 0), 0 -3px 5px 0 rgba(0, 0, 0, 0);
  bottom: 0;
  transition: 0.3s transform ease-in-out, 0.3s box-shadow;
  ${(props) =>
    props.$open &&
    css`
      box-shadow: 0 -5px 15px 0 rgba(0, 0, 0, 0.1), 0 -3px 5px 0 rgba(0, 0, 0, 0.1);
      transform: translateY(0);
    `}
`;

export const LeftPanel = styled.div<{ $open?: boolean }>`
  position: absolute;
  transform: translateX(-100%);
  background: #fff;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
  overflow-y: auto;
  transition: 0.5s transform;
  ${(props) =>
    props.$open &&
    css`
      transform: translateX(0);
    `}
`;

export const Lightbox = styled.div<{ $open?: boolean }>`
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

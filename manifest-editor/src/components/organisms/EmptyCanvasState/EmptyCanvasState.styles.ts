import styled, { css, keyframes } from "styled-components";

const transition = keyframes`
  0% { transform: translateY(-50%) }
  100% { transform: translateY(50%) }
`;

export const FloatingPanelContainer = styled.div<{ $reverse?: boolean }>`
  position: relative;
  margin-top: -80px;
  margin-bottom: -80px;

  ${(props) =>
    props.$reverse &&
    css`
      ${FloatingPanel} {
        animation-direction: reverse;
      }
    `}
`;

export const FloatingPanel = styled.div`
  padding: 20px;
  animation: ${transition} linear infinite 30s;
`;

export const FloatingPanelInner = styled.div`
  width: 100px;
  height: 140px;
  background: #d5ddeb;
  border-radius: 5px;
`;

export const TextOverlay = styled.div`
  position: absolute;
  height: 180px;
  //border: 1px solid salmon;
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 98%);
  left: 0;
  bottom: 0;
  right: 0;
`;

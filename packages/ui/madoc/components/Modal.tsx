import styled, { css } from "styled-components";
import { FullScreenEnterIcon } from "./FullScreenEnterIcon";
import { CloseIcon } from "./icons/CloseIcon";

export const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.2);
`;

export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 501;
  display: flex;
`;

const sizes = {
  sm: {
    maxWidth: "600px",
  },
  md: {
    maxWidth: "800px",
  },
  lg: {
    maxWidth: "1000px",
  },
};

export const InnerModalContainer = styled.div<{ size?: keyof typeof sizes; $expanded?: boolean }>`
  max-width: ${(props) => (props.$expanded ? "100%" : sizes[props.size || "sm"].maxWidth)};
  width: 100%;
  min-height: 250px;
  height: auto;
  display: flex;
  margin: 8em auto auto;
  padding: 0;
  flex-direction: column;
  max-height: 80vh;
  border-radius: 5px;
  overflow: hidden;
  box-shadow:
    4px 0 40px 0 rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.2);

  ${(props) =>
    props.$expanded &&
    css`
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      border-radius: 0;
      box-shadow: none;
      margin: 0;
      max-height: none;
      ${ModalBody} {
        flex: 1 1 0px;
      }
    `}
`;

export const ModalHeader = styled.div`
  //background: #ec5681;
  /* background: #5197d8;
  color: #fff; */
  color: #000;
  background: #fff;
  width: 100%;
  padding: 1em;
  display: flex;
`;

export const ModalHeaderTitle = styled.div`
  color: inherit;
  font-size: 1.2em;
  flex: 1 1 0px;
`;

export const ModalCloseIcon = styled(CloseIcon as any)`
  fill: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  &:hover {
    fill: rgba(0, 0, 0, 1);
  }
`;

export const ModalResizeIcon = styled(FullScreenEnterIcon as any)`
  fill: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  font-size: 1.2em;
  margin-right: 1em;
  &:hover {
    fill: rgba(0, 0, 0, 1);
  }
`;

export const ModalBody = styled.div`
  background: #fff;
  padding: 1em;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 230px;
`;

export const ModalFooter = styled.div<{ $footerAlignRight?: boolean }>`
  background: #eee;
  width: 100%;
  color: #fff;
  padding: 1em;
  display: flex;
  ${(props) =>
    props.$footerAlignRight &&
    css`
      flex-direction: row-reverse;
    `}
`;

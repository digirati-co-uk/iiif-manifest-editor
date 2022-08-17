import styled, { css } from "styled-components";
import { mainColor } from "../../../themes/tokens";

const Container = styled.div`
  width: 100%;
  overflow-y: auto;
  flex: 1;
`;

const Figure = styled.figure<{ $selected?: boolean }>`
  position: relative;
  min-height: 50px;
  margin: 1em;
  border-radius: 3px;
  display: flex;
  background: #f9f9f9;
  object-fit: scale-down;

  ${(props) =>
    props.$selected &&
    css`
      outline: 2px solid ${mainColor};
    `}

  img {
    pointer-events: none;
    width: 100%;
  }
`;

const Caption = styled.figcaption`
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  position: absolute;
  left: 0.5em;
  bottom: 0.5em;
  border-radius: 3px;
  font-size: 0.75em;
  padding: 0.5em 1em;
  max-height: 4.5em;
  overflow-y: auto;
  backdrop-filter: blur(5px);
  margin-right: 0.5em;
`;

export const CanvasVerticalStyles = {
  Container,
  Figure,
  Caption,
};

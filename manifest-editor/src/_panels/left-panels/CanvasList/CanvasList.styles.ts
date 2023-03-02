import styled, { css } from "styled-components";
import { mainColor } from "../../../themes/tokens";

const Container = styled.div`
  padding-bottom: 1.2em;
  flex: 1;
  overflow-y: auto;
  width: 100%;
  position: relative;
  height: 100%;
`;

const ItemContainer = styled.div<{ $selected?: boolean }>`
  padding: 0.75em 1em;
  border-bottom: 1px solid #eee;
  width: 100%;
  color: #333;

  &:hover {
    background: #f9f9f9;
  }

  ${(props) =>
    props.$selected &&
    css`
      background: ${mainColor};
      color: #fff;

      &:hover {
        background: ${mainColor};
      }
    `}
`;

const ItemIdentifier = styled.div`
  color: #999;
  background: #eee;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0.4em;
  font-size: 0.75em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: none;
`;

const ItemLabel = styled.div<{ $unwrap?: boolean }>`
  white-space: nowrap;
  font-size: 0.9em;
  text-transform: capitalize;

  > ${ItemIdentifier} {
    margin-block-start: 1em;
  }

  ${(props) =>
    props.$unwrap &&
    css`
      white-space: normal;
    `}
`;

const SectionLabel = styled.div`
  font-size: 0.8em;
  font-weight: bold;
  padding: 0.5em;
  color: #555;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0px;
`;

const Section = styled.div``;

export const CanvasListStyles = {
  Container,
  ItemContainer,

  ItemIdentifier,
  ItemLabel,
  SectionLabel,
  Section,
};

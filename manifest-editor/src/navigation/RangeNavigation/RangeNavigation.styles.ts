import styled, { css } from "styled-components";
import { lightgrey, mainColor } from "../../themes/tokens";

const Container = styled.div`
  position: relative;
  flex: 1;
  overflow-y: auto;
  width: 100%;
  padding: 1em;
`;

const ItemOuterContainer = styled.div`
  padding: 0.5em 0;
`;

const ItemContainer = styled.div<{ $selected?: boolean; $leaf?: boolean; $withSelector?: boolean }>`
  padding: 0.5em 1em;
  width: 100%;
  color: #333;
  border-radius: 3px;

  ${(props) =>
    props.$leaf &&
    css`
      &:hover {
        background: #f9f9f9;
      }
    `}

  ${(props) =>
    props.$selected &&
    props.$leaf &&
    !props.$withSelector &&
    css`
      background: ${mainColor};
      color: #fff;

      &:hover {
        background: ${mainColor};
      }
    `}

  ${(props) =>
    props.$selected &&
    props.$leaf &&
    props.$withSelector &&
    css`
      background: #e2ecff;
      color: #000;

      &:hover {
        color: #000;
        background: #e2ecff;
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
  overflow: hidden;

  > ${ItemIdentifier} {
    margin-block-start: 1em;
  }

  ${(props) =>
    props.$unwrap &&
    css`
      white-space: normal;
    `}
`;

const NestedContainer = styled.div`
  margin-left: 0.4em;
  margin-top: 1em;
`;

const CurrentRange = styled.div`
  font-weight: 600;
  background: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid #fff;
  position: sticky;
  top: -1em;
  backdrop-filter: blur(4px);
  padding: 1em;
`;

export const RangeNavigationStyles = {
  Container,
  ItemContainer,
  NestedContainer,
  ItemOuterContainer,
  ItemIdentifier,
  ItemLabel,
  CurrentRange,
};

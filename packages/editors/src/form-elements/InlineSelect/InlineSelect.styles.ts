import styled from "styled-components";

const Container = styled.div`
  background: #e4e7f0;
  display: flex;
  border: 1px solid #b1b1b1;
  border-radius: 3px;
  overflow: hidden;

  &[data-vertical="true"] {
    flex-direction: column;
    max-height: 13em;
    overflow: auto;
  }
`;

const Item = styled.button`
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.6em;
  color: #777;
  white-space: nowrap;
  font-size: 0.875em;

  &:hover {
    background: #eff2f6;
  }

  &:focus {
    // ?
  }

  & ~ & {
    border-left: 1px solid #b1b1b1;
  }

  &[data-active="true"] {
    background: #fff;
    color: #000;
  }

  [data-vertical="true"] & {
    border-left: none;
  }

  [data-vertical="true"] & ~ & {
    border-top: 1px solid #b1b1b1;
  }
`;

export const InlineSelectStyles = {
  Item,
  Container,
};

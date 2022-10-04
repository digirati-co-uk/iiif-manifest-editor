import styled, { css } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  font-size: 1em;
`;

export const ToolbarContainer = styled.div<{ $visible?: boolean }>`
  background: #fff;
  display: flex;
  align-items: center;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s;
  border: none;

  ${(props) =>
    props.$visible &&
    css`
      max-height: 2em;
      border: 1px solid #c9cfd5;
    `}
`;

export const ToolbarItem = styled.div<{ $active?: boolean }>`
  height: 1.8em;
  min-width: 1.8em;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.2em;
  a {
    font-size: 0.875em;
    color: #3498db;
    padding: 0 0.4em;
  }

  &:hover {
    background: #eee;
  }

  & ~ & {
    border-left: 1px solid #c9cfd5;
  }

  ${(props) =>
    props.$active &&
    css`
      background: #daedfa;
      &:hover {
        background: #daedfa;
      }
    `}
`;

export const ToolbarSpacer = styled.div`
  flex: 1;
`;

export const ToolbarIcon = styled.div`
  background: red;
`;

export const InlineLink = styled.a`
  color: #3498db;
  text-decoration: underline;
`;

// Link addition

export const FloatingActionOuterContainer = styled.div`
  position: relative;
`;

export const FloatingActionContainer = styled.div`
  position: absolute;
  background: #ffffff;
  border: 1px solid #c9cfd5;
  border-top: none;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07);
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
`;

export const FloatingActionInput = styled.input`
  background: #fff;
  font-size: 0.875em;
  padding: 0.2em 0.4em;
  flex: 1;
  border: none;
  display: block;
`;

export const FloatingActionButton = styled.button`
  background: #ddd;
  border-radius: 3px;
  color: #333;
  border: none;
  margin: 0.3em;
  padding: 0.3em;
  &:hover {
    background: #ccc;
  }
`;

export const StyledEditor = styled.div`
  padding: 0.8em;
  flex: 1;
  font-size: 1em;
  margin-bottom: 1px;
`;

export const CopyText = styled.div`
  width: calc(1.8em + 1px); /* Takes into account the 1px border of the toolbar */
  border-left: 1px solid #e8e8e8;
  cursor: pointer;
  align-self: normal;

  img {
    opacity: 0.5;
  }

  &:hover {
    background: #e9eaeb;
    img {
      opacity: 0.9;
    }
  }
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CloseIconContainer = styled(ToolbarItem)`
  width: 1.8em;
  border-left: 1px solid #cad0d5;
  height: 1.8em;
`;

export const LanguageDisplay = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(1.8em + 1px); /* Takes into account the 1px border of the toolbar */
`;
export const LanguageDisplayInner = styled.div`
  font-size: 0.6em;
  background: rgba(0, 0, 0, 0.06);
  color: #606060;
  font-weight: 600;
  border-radius: 3px;
  text-transform: uppercase;
  margin: 0.4em;
  padding: 0.5em;
  text-align: center;
`;

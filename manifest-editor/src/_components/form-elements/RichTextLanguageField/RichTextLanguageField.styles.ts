import styled, { css } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ToolbarContainer = styled.div`
  background: #fff;
  border: 1px solid #c9cfd5;
  display: flex;
  align-items: center;
`;

export const ToolbarItem = styled.div`
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
`;

export const ToolbarSpacer = styled.div`
  flex: 1;
`;

export const ToolbarIcon = styled.div`
  background: red;
`;

export const InputContainer = styled.div<{ $focus?: boolean }>`
  display: flex;
  width: 100%;
  background: #f8f9fa;
  border-bottom: 1px solid #cad0d5;

  ${(props) =>
    props.$focus &&
    css`
      border-color: ${props.theme.color.main || "#3498db"};
    `}
`;

export const InputInvisible = styled.input`
  background: transparent;
  flex: 1;
  border: none;
  font-size: 1em;
  padding: 0.8em;
  font-family: inherit;
  margin: 0;
  &:focus {
    outline: none;
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
  &:hover {
    background: #e9eaeb;
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
  background: red;
`;

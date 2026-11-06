import styled, { css } from "styled-components";
import { ButtonReset } from "@manifest-editor/ui/atoms/Button";
import { fieldText, placeholderColor } from "../TiptapLanguageFieldEditor/TiptapLanguageFieldEditor.styles";

export const AddAnother = styled.div<{ $active?: boolean }>`
  display: flex;
  width: 100%;
  padding: 0 0.5em;
  opacity: 0;
  transition: opacity 300ms;

  ${(props) =>
    props.$active &&
    css`
      opacity: 1;
    `}
`;

export const FormFieldWrapper = styled.div`
  width: 100%;
  margin-bottom: 0.5em;
`;

export const Label = styled.label`
  font-size: 1em;
  padding-left: 0.5em;
  font-weight: 500;
`;

export const EmptyLanguageField = styled(ButtonReset as any)`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 0 0.5em;
  background: #f8f9fa;
  border-bottom: 1px solid #cad0d5;
  text-align: left;
  transition: background 0.15s;

  > span {
    ${fieldText}
    flex: 1;
    color: ${placeholderColor};
  }

  > svg {
    flex: none;
    width: 1rem;
    height: 1rem;
    margin-right: 0.75rem;
    color: #9ca3af;
  }

  &:hover {
    background: #eceef5;
  }

  &:focus-visible {
    outline: 2px solid ${(props: any) => props.theme?.color?.main || "#b84c74"};
    outline-offset: -2px;
  }
`;

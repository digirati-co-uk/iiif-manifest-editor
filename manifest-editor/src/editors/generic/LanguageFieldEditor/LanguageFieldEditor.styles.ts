import styled, { css } from "styled-components";
import { ButtonReset } from "../../../atoms/Button";

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

export const EmptyLanguageField = styled(ButtonReset)`
  padding: 0.8em 1em;
  background: #f8f9fa;
  color: #999;
  font-size: 0.8em;
  border-bottom: 1px solid rgba(5, 42, 68, 0.2);
  width: 100%;
  display: flex;
  margin-bottom: 1rem;
`;

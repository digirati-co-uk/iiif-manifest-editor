import styled, { css } from "styled-components";
import { ButtonReset } from "@manifest-editor/ui/atoms/Button";
import { Form } from "@manifest-editor/components";

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

export const Label = Form.Label;

export const EmptyLanguageField = styled(ButtonReset as any)`
  padding: 0.8em 1em;
  background: #f8f9fa;
  color: #999;
  font-size: 0.9em;
  border-bottom: 1px solid rgba(5, 42, 68, 0.2);
  margin: 0.5em 0 2.18em;
  display: block;
  text-align: left;
  width: 100%;
`;

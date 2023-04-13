import React, { useRef } from "react";
import styled, { css } from "styled-components";
import { FlexContainer } from "../components/layout/FlexContainer";

export const InputLabel = styled.label<{
  $caps?: boolean;
  $inline?: boolean;
  $margin?: boolean;
}>`
  letter-spacing: -0.3px;
  font-weight: 500;
  line-height: 2.4em;
  display: flex;
  align-items: baseline;
  width: 100%;
  flex-direction: column;
  // padding: 0 ${(props: any) => props.theme.padding.medium || "1rem"};
  ${(props: any) =>
    props.$caps &&
    css`
      text-transform: capitalize;
    `};
  ${(props: any) =>
    props.$inline &&
    css`
      flex-direction: row;
      align-items: center;
      width: unset;
    `};
`;

export const InputFieldset = styled.fieldset`
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0.5em;

  ${InputLabel} {
    font-size: 0.875em;
  }
`;

export const MutliselectLabel = styled(InputLabel)<{
  $selected?: boolean;
}>`
  width: fit-content;
  flex-direction: row;
  align-items: center;
  padding: 0 ${(props: any) => props.theme.padding.small || "1rem"};
  margin: ${(props: any) => props.theme.padding.xs || "1rem"} ${(props: any) => props.theme.padding.xs || "1rem"};
  background-color: ${(props: any) => props.theme.color.white || "white"};
  color: ${(props: any) => props.theme.color.main || "#347cff;"};
  border: 1px solid ${(props: any) => props.theme.color.main || "#347cff;"};
  border-radius: 20px;
  cursor: pointer;
  height: 2rem;
  display: flex;
  align-items: center;
  white-space: nowrap;
  ${(props: any) =>
    props.$selected &&
    css`
      color: ${props.theme.color.white || "white"};
      background-color: ${props.theme.color.main || "#347cff;"};
    `}

  :hover {
    color: ${(props: any) => props.theme.color.white || "white"};
    background-color: ${(props: any) => props.theme.color.main || "#347cff;"};
  }
`;

export const CheckboxInput = styled.input.attrs({ type: "checkbox" })``;

export const _Input = styled.input`
  background: ${(props: any) => props.theme.color.white || "white"};
  border: 1px solid rgba(5, 42, 68, 0.2);
  padding: 0.8em;
  font-size: 0.875em;
  line-height: 1.2em;
  border-radius: 3px;

  width: 100%;
  box-shadow: 0 0 0 0 transparent inset;
  &:focus {
    border-color: ${(props: any) => props.theme.color.black || "black"};
    outline: none;
  }
  margin: 0;
  display: block;
  outline: 0;
  font-family: inherit;
  -webkit-appearance: none;
  tap-highlight-color: rgba(255, 255, 255, 0);
  color: rgba(0, 0, 0, 0.87);
  &:focus {
    border-color: ${(props: any) => props.theme.color.main || "main"};
    outline: none;
  }

  &:disabled {
    background: #eee;
    cursor: not-allowed;
  }
`;

export const InputUnderlined = styled(_Input)`
  border-radius: unset;
  background-color: #f8f9fa;
  border-top: none;
  border-left: none;
  border-right: none;
  white-space: pre-line;

  &:focus {
    background: #eceef5;
  }
`;

export const InputGroup = styled(FlexContainer)<{ $active?: boolean }>`
  display: flex;
  width: calc(100% + 1em);
  padding: 0.5em;
  margin-left: -0.5em;
  margin-right: -0.5em;

  ${(props) =>
    props.$active &&
    css`
      border-radius: 5px;
      transition: background 200ms;
      &:hover {
        background-color: ${(props: any) => props.theme.color.highlight || "yellow"};
      }
    `}
`;

export const Submit = styled.input.attrs({
  type: "submit",
  value: "Load",
})`
  padding: 0 ${(props: any) => props.theme.padding.medium || "1rem"};
  color: ${(props: any) => props.theme.color.white || "white"};
  background-color: ${(props: any) => props.theme.color.main || "#347cff;"};
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  height: 2rem;
  display: flex;
  align-items: center;
`;

export const Input: typeof _Input = React.forwardRef((props: any, ref) =>
  props.type === "checkbox" ? <CheckboxInput ref={ref} {...props} /> : <InputUnderlined ref={ref} {...props} />
) as any;

export const HighlightInput: typeof _Input = ((props: any) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <InputUnderlined
      ref={ref}
      onFocus={() => {
        if (ref.current) {
          ref.current.select();
        }
      }}
      {...props}
    />
  );
}) as any;

export const InputBorderless = styled.input`
  background: transparent;
  border: none;
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  font-size: 0.9em;
  line-height: 1.3em;
  width: 100%;
  box-shadow: none;
  border: none;
  &:focus {
    border-color: ${(props: any) => props.theme.color.main || "main"};
    outline: none;
  }
`;

export const Fieldset = styled.fieldset`
  border: none;
  background: none;
  padding: 0;
  margin: 0;
`;

export const InputContainer = styled.div<{
  wide?: boolean;
  fluid?: boolean;
  $error?: boolean;
}>`
  display: flex;
  flex-direction: column;
  max-width: ${(props: any) => (props.fluid ? "100%" : props.wide ? "550px" : "360px")};
  margin-bottom: 1em;
  width: 100%;

  ${(props: any) =>
    props.$error &&
    css`
      background: ${props.theme.color.lightdanger || "#ffeaea"};
      outline: 5px solid ${props.theme.color.lightdanger || "#ffeaea"};
      input,
      textarea {
        border-color: ${props.theme.color.danger || "#9c2824"};
      }
    `}
`;

export const FieldsetContainer = styled.fieldset<{ $inline?: boolean }>`
  padding: 0 1em 1em;
  border: 1px solid #ddd;
  border-radius: 3px;

  ${InputContainer}:first-child {
    margin-top: 0.5em;
  }

  margin-bottom: 0.5em;

  ${(props) =>
    props.$inline &&
    css`
      padding: 0;
      margin: 0;
      border: none;
    `}
`;

export const InputCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5em;

  label {
    flex: 1 1 0px;
    margin: 0;
    margin-left: 1em;
  }
`;

export const InputCheckboxInputContainer = styled.div<{ $checked?: boolean }>`
  background: ${(props: any) => props.theme.color.grey || "grey"};
  height: 2em;
  width: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props: any) => props.theme.color.grey || "grey"};
  ${(props: any) =>
    props.$checked &&
    css`
      background-color: ${props.theme.color.lightsuccess || "#c5e8c5"};
      border-color: ${props.theme.color.sucess || "#6ccd55"};
    `}
`;

export const EmptyInputValue = styled.div<{ wide?: boolean }>`
  background: ${(props: any) => props.theme.color.grey || "grey"};
  border: 1px solid rgba(5, 42, 68, 0.2);
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"}
    ${(props: any) => props.theme.padding.medium || "1rem"};
  font-size: 0.85em;
  line-height: 1.3em;
  border-radius: 0;
  width: 100%;
  box-shadow: none;
  max-width: ${(props: any) => (props.wide ? "550px" : "450px")};
  margin-bottom: 0.8em;
  &:focus {
    border-color: #333;
    outline: none;
  }
`;

export const InputLink = styled.a`
  margin: 0.5em 0;
  font-size: 0.75em;
  color: ${(props: any) => props.theme.color.main || "main"};
`;

export const HiddenCheckbox = styled.input`
  display: none;
`;

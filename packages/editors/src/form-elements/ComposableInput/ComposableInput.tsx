import styled, { css } from "styled-components";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";

const ContainerStyles = styled.fieldset<{ $focus?: boolean; $disabled?: boolean; $button?: boolean }>`
  display: flex;
  font-size: 0.875em;
  width: 100%;
  background: #f8f9fa;
  border: none;
  padding: 0;
  margin: 0;
  border-bottom: 1px solid #cad0d5;
  text-align: left;
  align-items: center;

  &:focus {
    outline: none;
    background: #eceef5;
  }

  ${(props) =>
    props.$focus &&
    css`
      background: #eceef5;
      border-color: ${props.theme.color.main || "#3498db"};
    `}
  ${(props) =>
    props.$disabled &&
    css`
      pointer-events: none;
    `}
  ${(props) =>
    props.$button &&
    css`
      cursor: pointer;
      &:hover {
        background: #eceef5;
      }
    `}
` as any;

const invisibleReset = css`
  color: rgba(0, 0, 0, 0.87);
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
  resize: none;
`;

const Text = styled.input.attrs({ type: "text" })`
  ${invisibleReset}
  overflow-y:hidden;
`;

const Number = styled.input.attrs({ type: "number" })`
  ${invisibleReset}
`;

const ReadOnly = styled.div`
  ${invisibleReset}
`;

type ContainerProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  disabled?: boolean;
  as?: any;
  $focus?: boolean;
  $button?: boolean;
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { disabled, as, $button, ...props }: ContainerProps,
  ref
) {
  const [_focus, setFocus] = useState(false);
  const internalRef = useRef<HTMLDivElement>(null);
  const focus = props.$focus || _focus;

  useLayoutEffect(() => {
    if (internalRef.current) {
      const _focusHandler = () => setFocus(true);
      const _blurHandler = () => setFocus(false);
      const $inputs = internalRef.current.querySelectorAll("input");
      for (const $input of $inputs) {
        $input.addEventListener("focus", _focusHandler);
        $input.addEventListener("blur", _blurHandler);
      }
      return () => {
        for (const $input of $inputs) {
          $input.removeEventListener("focus", _focusHandler);
          $input.removeEventListener("blur", _blurHandler);
        }
      };
    }
  }, []);

  return (
    <ContainerStyles
      as={as || $button ? "button" : "fieldset"}
      $button={$button}
      ref={(s: any) => {
        (internalRef as any).current = s;
        if (ref) {
          (ref as any).current = s;
        }
      }}
      $focus={focus}
      $disabled={disabled}
      disabled={disabled}
      {...props}
    ></ContainerStyles>
  );
});

export const ComposableInput = {
  Container,
  Text,
  Number,
  ReadOnly,
};

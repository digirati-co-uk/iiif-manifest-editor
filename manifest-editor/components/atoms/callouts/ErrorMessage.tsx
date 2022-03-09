import styled, { css } from "styled-components";

export const ErrorMessage = styled.div<{ $small?: boolean }>`
  background: ${(props: any) => props.theme.color.danger || "red"};
  color: ${(props: any) => props.theme.color.white || "white"};
  width: 100%;
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"}
    ${(props: any) => props.theme.padding.medium || "1rem"};
  line-height: 1.9em;
  ${(props) =>
    props.$small &&
    css`
      font-size: 0.75em;
      padding: ${props.theme.padding.xs || "0.25rem"}
        ${props.theme.padding.small || "0.5rem"};
      line-height: 1.6em;
    `}
`;

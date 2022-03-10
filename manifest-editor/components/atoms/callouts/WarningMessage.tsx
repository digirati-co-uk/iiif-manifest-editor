import styled, { css } from "styled-components";

export const WarningMessage = styled.div<{ $small?: boolean }>`
  background: ${(props: any) => props.theme.color.warning || "orange"};
  color: ${(props: any) => props.theme.color.white || "white"};
  width: 100%;
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"}
    ${(props: any) => props.theme.padding.medium || "1rem"};
  line-height: 1.9em;
  display: flex;
  align-items: center;
  a {
    color: ${(props: any) => props.theme.color.white || "white"};
  }
  ${(props) =>
    props.$small &&
    css`
      font-size: 0.75em;
      padding: ${props.theme.padding.xs || "0.25rem"}
        ${props.theme.padding.small || "0.5rem"};
      line-height: 1.6em;
      width: 16rem;
    `}
`;

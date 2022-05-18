import styled, { css } from "styled-components";

export const SuccessMessage = styled.div<{ $small?: boolean }>`
  border: 2px solid ${(props: any) => props.theme.color.sucess || "green"};
  width: 100%;
  border-radius: 5px;
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
      white-space: nowrap;
      padding: ${props.theme.padding.xs || "0.25rem"} ${props.theme.padding.small || "0.5rem"};
      line-height: 1.6em;
      width: fit-content;
    `}
`;

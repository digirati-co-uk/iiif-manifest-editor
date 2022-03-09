import styled from "styled-components";

export const WarningMessage = styled.div`
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
`;

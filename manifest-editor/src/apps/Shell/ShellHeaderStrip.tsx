import styled from "styled-components";

export const ShellHeaderStrip = styled.div`
   {
    padding: 0 1em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${(props: any) => props.theme.black || "black"};
    padding: ${(props: any) => props.theme.padding.medium || "1rem"} 0 0 0;
  }
`;

import styled from "styled-components";

export const ShellHeaderStrip = styled.div`
   {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${(props: any) => props.color || "black"};
    padding: ${(props: any) => props.theme.padding.medium || "1rem"} 0 0 0;
  }
`;

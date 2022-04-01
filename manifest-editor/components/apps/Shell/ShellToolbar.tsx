import styled from "styled-components";

export const ShellToolbar = styled.div`
   {
    display: flex;
    align-items: center;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    padding: ${(props: any) => props.theme.padding.small || "0.25rem"} 0;
    box-shadow: ${(props: any) => props.theme.shadows.bottom || ""};
  }
`;

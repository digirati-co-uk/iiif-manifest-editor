import styled from "styled-components";

export const ShellHeaderStrip = styled.div`
   {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${(props: any) => props.color || "black"};
    margin: 0.375rem 0;
    padding: 0.25rem 0;
  }
`;

import styled from "styled-components";

export const Toolbar = styled.div`
   {
    display: flex;
    color: ${(props: any) => props.color || "black"};
    border-top: 0.016rem solid #dddddd;
    border-bottom: 0.016rem solid #dddddd;
    justify-content: flex-start;
  }
`;

import styled from "styled-components";

export const Button = styled.button`
   {
    padding: 0.12em;
    margin: 0.12em;
    color: ${(props: any) => props.color || "none"};
    border: none;
    cursor: pointer;
  }
`;

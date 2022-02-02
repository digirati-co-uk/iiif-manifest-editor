import styled from "styled-components";

export const Button = styled.button`
   {
    padding: 0.12em;
    color: ${(props: any) => props.color || "#6b6b6b"};
    background: #dddddd;
    border: none;
    cursor: pointer;
  }
`;

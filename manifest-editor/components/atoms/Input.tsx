import styled from "styled-components";

export const Input = styled.input`
   {
    padding: 0.5em;
    margin: 0.5em;
    color: ${(props: any) => props.inputColor || "palevioletred"};
    background: FloralWhite;
    border: none;
    border-radius: 3px;
  }
`;

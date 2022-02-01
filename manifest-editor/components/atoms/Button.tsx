import styled from "styled-components";

export const Button = styled.button`
   {
    padding: 0.5em;
    margin: 0.5em;
    color: ${(props: any) => props.inputColor || "palevioletred"};
    background: papayawhip;
    border: 0.75px;
    border-radius: 3px;
  }
`;

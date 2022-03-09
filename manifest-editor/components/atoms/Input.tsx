import styled from "styled-components";

export const Input = styled.input`
   {
    padding: ${(props: any) => props.theme.padding.small || "1rem"}
    margin:  ${(props: any) => props.theme.padding.small || "1rem"}
    color: ${(props: any) => props.theme.color.main || "black"};
    background: ${(props: any) => props.theme.color.white || "white"};
    border: none;
    border-radius: 3px;
  }
`;

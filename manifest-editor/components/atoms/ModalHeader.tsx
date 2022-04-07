import styled from "styled-components";

export const ModalHeader = styled.h3<{ $color?: "manifest" | "canvas" }>`
   {
    font-size: 18px;
    font-weight: normal;
    text-align: center;
    padding: ${(props: any) => props.theme.padding.small || "1rem"};
    width: 100%;
    border: 2px solid
      ${(props: any) => props.theme.iiifColor[props.$color] || "none"};
    border-radius: 5px;
  }
`;

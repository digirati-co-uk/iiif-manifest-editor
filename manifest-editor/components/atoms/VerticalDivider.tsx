import styled from "styled-components";

export const VerticalDivider = styled.div`
   {
    border-right: 0.031rem solid ${(props: any) => props.theme.color.grey || "grey"};
    height: 100%;
  }
`;

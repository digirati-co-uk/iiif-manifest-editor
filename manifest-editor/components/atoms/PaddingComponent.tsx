import styled from "styled-components";
export const PaddingComponentLarge = styled.div`
  padding: ${(props: any) => props.theme.padding.large || "2rem"};
`;

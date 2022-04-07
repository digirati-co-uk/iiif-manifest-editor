import styled from "styled-components";
export const PaddingComponentLarge = styled.div`
  padding: ${(props: any) => props.theme.padding.large || "2rem"};
`;

export const PaddingComponentMedium = styled.div`
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
`;

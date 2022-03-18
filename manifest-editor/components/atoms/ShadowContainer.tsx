import styled from "styled-components";

export const ShadowContainer = styled.div`
  box-shadow: ${(props: any) => props.theme.shadows.standard || ""};
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
`;

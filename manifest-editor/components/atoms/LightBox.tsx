import styled from "styled-components";

export const LightBox = styled.div`
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
  border: 1px solid ${(props: any) => props.theme.color.mediumgrey || "grey"};
  border-radius: 5px;
`;

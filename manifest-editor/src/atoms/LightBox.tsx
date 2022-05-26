import styled from "styled-components";

export const LightBox = styled.div`
  padding: 1rem;
  border: 1px solid ${(props: any) => props.theme.color.mediumgrey || "grey"};
  border-radius: 5px;
  & h4 {
    padding: 0 0 0 1rem;
    margin: 0;
  }
`;

export const LightBoxWithoutSides = styled.div`
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
  border-top: 1px solid ${(props: any) => props.theme.color.mediumgrey || "grey"};

  &:last-of-type {
    border-bottom: 1px solid ${(props: any) => props.theme.color.mediumgrey || "grey"};
  }
`;

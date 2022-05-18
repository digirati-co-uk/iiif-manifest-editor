import styled from "styled-components";

export const CanvasContainer = styled.div`
   {
    height: 100%;
    width: 100%;
    min-width: 0;
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
    @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
      display: none;
    }
  }
`;

export const GhostCanvas = styled.div`
  height: 100%;
  width: 100%;
  min-width: 0;

  border: 2px dashed ${(props: any) => props.theme.color.mediumgrey || "grey"};
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    display: none;
  }
`;

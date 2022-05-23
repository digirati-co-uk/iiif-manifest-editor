import styled from "styled-components";
import { FlexContainer } from "../../layout/FlexContainer";

export const LoadManifestWidget = styled(FlexContainer)`
  width: 100%;
  justify-content: space-between;
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    flex-wrap: wrap;
  }
`;

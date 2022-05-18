import { FlexContainerRow } from "../components/layout/FlexContainer";

import styled from "styled-components";

export const Editor = styled(FlexContainerRow)`
  justify-content: space-between;
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    flex-direction: column;
  } ;
`;

import { FlexContainerRow } from "../layout/FlexContainer";

import styled from "styled-components";

export const Editor = styled(FlexContainerRow)`
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    flex-direction: column;
  };
`;

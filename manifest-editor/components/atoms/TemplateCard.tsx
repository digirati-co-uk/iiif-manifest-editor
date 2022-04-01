import styled from "styled-components";
import { FlexContainerColumn } from "../layout/FlexContainer";

export const TemplateCardContainer = styled(FlexContainerColumn)`
  align-items: center;
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
  max-width: 10rem;
  height: fit-content;
`;

export const TemplateCardNew = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  height: 8rem;
  width: 6.25rem;
  border-radius: 2px;
  border: 2px solid ${(props: any) => props.theme.color.mediumgrey || "grey"};
  padding: ${(props: any) => props.theme.padding.xs || "0.25rem"};
`;

export const TemplateCardPlaceholder = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${(props: any) => props.theme.color.mediumgrey || "grey"};
  border-radius: 2px;
`;

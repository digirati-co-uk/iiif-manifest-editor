import styled from "styled-components";
import { FlexContainerColumn } from "../components/layout/FlexContainer";

export const TemplateCardContainer = styled(FlexContainerColumn)`
  align-items: center;
  max-width: 10rem;
  height: fit-content;
  color: grey;
  font-size: 0.75rem;
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

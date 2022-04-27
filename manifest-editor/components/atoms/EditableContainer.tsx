import styled from "styled-components";

export const EditableContainer = styled.div`
  border-top: 1px solid
    ${(props: any) => props.theme.color.mediumgrey || "grey"};
  border-bottom: 1px solid
    ${(props: any) => props.theme.color.mediumgrey || "grey"};
`;

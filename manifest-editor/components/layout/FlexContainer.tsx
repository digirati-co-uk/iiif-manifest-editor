import styled from "styled-components";

export const FlexContainerRow = styled.div<{justify: string}>`
   {
    display: flex;
    flex-direction: row;
    justify-content: ${(props: any) => props.justify || "flex-start"};
  }
`;

export const FlexContainerColumn = styled.div<{justify: string}>`
   {
    display: flex;
    flex-direction: column;
    justify-content: ${(props: any) => props.justify || "flex-start"};
  }
`;

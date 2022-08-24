import styled from "styled-components";

export const FlexContainerRow = styled.div<{ justify?: string }>`
  display: flex;
  flex-direction: row;
  justify-content: ${(props: any) => props.justify || "flex-start"};
`;
export const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const FlexContainerColumn = styled.div<{ justify?: string }>`
  display: flex;
  flex-direction: column;
  justify-content: ${(props: any) => props.justify || "flex-start"};
`;

export const FlexImage = styled.div`
  max-height: 256px;
  flex: 1;
  display: flex;
  justify-content: center;
  background: #f9f9f9;
  margin-bottom: 0.5em;
  img {
    object-fit: contain;
    width: 100%;
  }
`;

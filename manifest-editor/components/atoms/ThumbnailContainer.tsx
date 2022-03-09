import styled from "styled-components";

export const ThumbnailContainer = styled.div`
   {
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
    color: ${(props: any) => props.color || "black"};
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-height: 90vh;
    overflow-y: auto;
    width: 124px;
  }
`;

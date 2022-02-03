import styled from "styled-components";

export const ThumbnailContainer = styled.div`
   {
    padding: 0.375rem;
    color: ${(props: any) => props.color || "black"};
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-height: 90vh;
    overflow-y: scroll;
    width: 124px;
  }
`;

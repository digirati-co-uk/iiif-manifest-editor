import styled from "styled-components";

export const ThumbnailContainer = styled.div`
   {
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
    color: ${(props: any) => props.color || "black"};
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: auto;
    overflow-y: auto;
    width: fit-content;
    @media (max-width: ${(props: any) =>
        props.theme.device.tablet || "770px"}) {
      flex-direction: row;
      width: 80%;
      overflow-x: auto;
    }
  }
`;

export const SmallThumbnailStripContainer = styled.div`
   {
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
    color: ${(props: any) => props.color || "black"};
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    height: 10rem;
    overflow-x: auto;
    width: 100%;
  }
`;

export const ThumbnailGrid = styled.div`
   {
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
    color: ${(props: any) => props.color || "black"};
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    max-height: 90vh;
    overflow-y: auto;
    width: 100%;
    flex-wrap: wrap;
    @media (max-width: ${(props: any) =>
        props.theme.device.tablet || "770px"}) {
      flex-direction: row;
      overflow-x: auto;
    }
  }
`;

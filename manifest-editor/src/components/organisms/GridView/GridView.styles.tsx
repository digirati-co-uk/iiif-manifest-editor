import styled, { css } from "styled-components";

export const GridViewContainer = styled.div<{ strip?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 80vh;
  .list {
    flex-direction: row;
    display: flex;
    justify-content: unset;
    max-height: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
    margin: 0 -10px;
    justify-content: space-evenly;
    ${(props: any) =>
      props.strip &&
      css`
        flex-direction: column;
        flex-wrap: nowrap;
        max-height: unset;
      `}
    & > * {
      margin: 10px;
    }
    a {
      text-decoration: none;
    }
  }
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    height: unset;
    min-height: 50vh;
    .list {
      flex-direction: row;
      overflow-x: auto;
    }
  }
`;

export const Group = styled.div`
  z-index: 2;
  display: flex;
  flex-direction: row;
  margin: 1rem 0;
  .item {
    visibility: hidden;
    float: right;
    border-radius: 5px;
    padding: 5px;
    transform: translateX(-40px);
    background-color: ${(props: any) => props.theme.color.greyOverlay || "grey"};
    height: fit-content;
  }
  &:hover {
    .item {
      visibility: visible;
      z-index: 3;
    }
  }
`;

export const ThumnbnailLabel = styled.small`
  white-space: nowrap;
  text-align: center;
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ThumbnailContainer = styled.div<{ size?: number; selected?: boolean }>`
  ${(props: any) =>
    props.selected &&
    css`
      border: 5px solid ${props.theme.color.main};
    `}
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: any) => props.theme.color.black || "grey"};
  width: ${(props) => props.size && props.size + 10}px;
  height: ${(props) => props.size && props.size + 10}px;
  img {
    max-width: 100%;
  }
`;

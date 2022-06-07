import styled, { css } from "styled-components";

export const GridViewContainer = styled.div<{ strip?: boolean; $column?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  .list {
    flex-direction: row;
    display: flex;
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    flex-wrap: wrap;
    justify-content: center;
    ${(props: any) =>
      props.strip &&
      css`
        flex-direction: column;
        flex-wrap: nowrap;
        max-height: unset;
      `}
    & > * {
      margin: 10px;
      ${(props) =>
        props.$column &&
        css`
          width: 100%;
          display: flex;
          justify-content: center;
        `}
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
  margin-right: -40px;
  overflow: hidden;
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

export const ThumbnailContainer = styled.div<{ size?: number; selected?: boolean; $cover?: boolean }>`
  border: 5px solid transparent;
  ${(props: any) =>
    props.selected &&
    css`
      border-color: ${props.theme.color.main};
    `}
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  background-color: #000;

  img {
    max-width: 100%;
    ${(props) =>
      props.$cover &&
      css`
        object-fit: cover;
      `}
  }
`;

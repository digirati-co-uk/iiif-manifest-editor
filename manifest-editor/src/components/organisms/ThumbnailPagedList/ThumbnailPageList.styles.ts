import styled, { css } from "styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";

const highlight = "#31738E";
const greyBg2 = "#373d46";

export const Thumbnail = styled.div<{ $active?: boolean }>`
  background: ${greyBg2};
  border-radius: 5px;
  padding: 5px;
  outline: 2px solid transparent;

  transition: outline-color 240ms;
  ${(props) =>
    props.$active &&
    css`
      outline: 2px solid ${highlight};
    `}
`;

export const ThumbnailCover = styled(Thumbnail)`
  height: auto;
  width: 100%;
  grid-column: 1 / -1;
  img {
    margin: 0 auto;
    width: 256px;
    height: 256px;
  }
`;

export const ThumbnailPlaceholder = styled.div`
  display: inline-block;
  width: 128px;
  height: 128px;
  background: ${greyBg2};
`;

export const ThumbnailImage = styled(LazyLoadImage)`
  display: block;
  max-width: 100%;
  user-drag: none;
  object-fit: contain;
  object-position: center;
  width: 128px;
  height: 128px;
`;

export const ThumbnailViewer = styled.div`
  padding: 1em;
  overflow: auto;
  height: 100%;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: min-content;
  justify-items: center;
`;

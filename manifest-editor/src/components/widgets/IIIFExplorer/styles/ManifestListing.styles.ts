import { scss as css } from "@acab/ecsstatic";

export const ManifestListing = css`
  overflow: auto;
  container: listing-c/size;
  flex: 1;
  position: relative;
`;
export const ThumbnailList = css`
  --thumb-size: 150px;
  --thumb-ratio: 1;
  --item-count: 1;

  background: #fff;
  padding: 1em;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(calc(var(--thumb-size)), 1fr));
  justify-content: space-between;
  gap: 0.2em;

  @container (min-width: 400px) {
    gap: 0.875em;
  }
`;

export const ThumbnailGroup = css`
  background: #fff;
  padding: 2px;
  display: flex;
  grid-column-end: span var(--item-count, 1);
  align-items: center;
`;

export const ThumbnailItem = css`
  background: #fff;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 2px;
  border-radius: 3px;
  &:hover {
    background: #ddd;
  }
`;

export const ThumbnailImage = css`
  flex: 1;
  background: #f9f9f9;
  min-height: 0;
  display: flex;
  aspect-ratio: var(--thumb-ratio);
  max-height: var(--thumb-size);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const ThumbnailLabel = css`
  white-space: nowrap;
  overflow: hidden;
  height: 1.2rem;
  padding: 0 0.2em;
  display: flex;
  align-items: center;
  font-size: 0.875em;
`;

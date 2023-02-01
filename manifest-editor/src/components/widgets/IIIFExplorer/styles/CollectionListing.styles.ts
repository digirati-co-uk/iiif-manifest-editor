import { scss as css } from "@acab/ecsstatic";
export const collectionListingContainer = css`
  color: red;
  padding: 0 0.2em;
  overflow-y: auto;
  --grid-icon-size: 130px;

  @container (min-width: 400px) {
    padding: 0.3em 0.5em;
  }

  @container (min-width: 525px) and (min-height: 300px) {
    padding: 0.875em;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--grid-icon-size, 130px), 1fr));
    justify-content: space-between;
    background-color: inherit;
    gap: 0.875em;
    width: 100%;
  }

  @container (min-width: 680px) {
    --grid-icon-size: 180px;
  }
`;
export const collectionItem = css`
  display: grid;
  grid-template-columns: 2em auto;
  grid-template-areas: "icon label";
  grid-gap: 0.4em;
  border-radius: 3px;
  margin: 0.2em 0;
  padding: 0.2em;

  &:hover {
    background: #f9f9f9;
  }

  @container (min-width: 400px) {
    padding: 0.4em;
  }

  @container (min-width: 525px) and (min-height: 300px) {
    grid-template-columns: auto;
    grid-template-areas: "icon" "label";
  }

  &[data-active="true"] {
    background: #dee3e7;

    &:hover {
      background: #dee3e7;
    }
  }
`;
export const collectionIcon = css`
  grid-area: icon;
  align-self: center;
  display: flex;
  background: #f0f0f0;
  aspect-ratio: 1;
  border-radius: 3px;
  padding: 0.2em;
  align-items: center;

  ${collectionItem}[data-active="true"] & {
    background: #fff;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @container (min-width: 400px) {
    aspect-ratio: 1;
  }
`;
export const collectionMeta = css`
  grid-area: label;
  overflow: hidden;
`;

export const collectionLabel = css`
  font-weight: 500;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const collectionType = css`
  color: #999;
  font-size: 0.875em;
`;

import { scss as css } from "@acab/ecsstatic";

const ListingGrid = css`
  padding: 0.875em;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-icon-size, 130px), 1fr));
  justify-content: space-between;
  background-color: inherit;
  gap: 0.875em;
  width: 100%;
  cursor: pointer;
`;

const Item = css`
  background: #fff;
  padding: 0.5em;
  border-radius: 5px;
  border: 1px solid #ddd;
  max-width: 200px;
  &:hover {
    border-color: blue;
  }
`;

const ItemIcon = css`
  width: 100%;
  background: #eee;
  aspect-ratio: 1;
  margin-bottom: 0.5em;
  align-items: center;
  border-radius: 3px;
  justify-content: center;
  padding: 0.5em;
  img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ItemLabel = css`
  font-size: 0.9em;
  margin-bottom: 0.2em;
`;

const ItemSummary = css`
  color: #999;
  font-size: 0.875em;
`;

export const baseCreatorStyles = {
  ListingGrid,
  Item,
  ItemIcon,
  ItemLabel,
  ItemSummary,
};

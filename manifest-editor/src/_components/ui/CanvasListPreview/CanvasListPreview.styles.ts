import { scss as css } from "@acab/ecsstatic";

const Item = css`
  padding: 0.2em 0.5em;
  cursor: pointer;
  border-radius: 3px;
  &:hover {
    background: #e8f0fe;
  }
`;

const Label = css`
  font-size: 1em;
`;

const ItemMargin = css`
  margin-bottom: 0.5em;
`;

export const canvasListPreviewStyles = { Item, Label, ItemMargin };

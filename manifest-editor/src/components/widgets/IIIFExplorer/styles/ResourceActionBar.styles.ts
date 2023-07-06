import { scss as css } from "@acab/ecsstatic";

export const ResourceActionBarContainer = css`
  padding: 0.4em;
  display: flex;
  margin-top: auto;
`;

export const ResourceActions = css`
  display: flex;
  align-items: center;

  > * ~ * {
    margin-left: 0.2em;
  }
`;
export const ResourceAction = css`
  background: blue;
  color: #fff;
  border: none;
  display: block;
  padding: 0.4em 0.8em;

  &:hover {
    background: lightblue;
  }
`;

export const ResourceActionMeta = css`
  flex: 1;
  min-width: 0;
  margin-right: 1lh;
`;

export const ResourceActionLabel = css`
  color: #444;
  font-size: 0.7em;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
`;
export const ResourceActionDescription = css`
  color: #999;
  font-size: 0.875em;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const ResourceActionComposite = css`
  background: blue;
  color: #fff;
  display: flex;
`;

export const ResourceActionCompositeSegment = css`
  background: transparent;
  border: none;
  color: inherit;
  display: block;

  &:hover {
    background: lightblue;
  }
`;

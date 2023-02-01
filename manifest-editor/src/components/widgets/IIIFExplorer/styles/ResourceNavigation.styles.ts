import { scss as css } from "@acab/ecsstatic";

export const resourceNavContainer = css`
  display: grid;
  grid-template-columns: 2.2em auto 2.2em;
  border-bottom: 1px solid #dddddd;
  align-items: flex-start;
  padding: 0 0.2em;
  font-size: 0.875em;

  @container (min-width: 400px) {
    font-size: 1em;
  }
`;
export const resourceNavIcon = css`
  aspect-ratio: 1;
  padding: 0.3em;
  margin-top: 0.2em;
  display: flex;
  border-radius: 3px;

  &:hover {
    background: #eee;
  }

  img,
  svg {
    width: 100%;
  }
`;

export const resourceNavListItem = css`
  margin: 0.2em;
  border-radius: 3px;
  padding: 0.25em;
  display: grid;
  grid-template-columns: 1.75em auto;
  grid-gap: 0.35em;
  align-items: center;
  color: inherit;
  text-decoration: none;

  &:hover {
    background: #eee;
    text-decoration: underline;
  }

  &[data-active="true"] {
    background: var(--resource-nav-active, #e4effe);
  }
`;

export const resourceNavListItemIcon = css`
  color: red;
  overflow: hidden;
  display: flex;
  user-select: none;

  img {
    z-index: 2;
    position: relative;
    width: 100%;
  }
`;

export const resourceNavListItemLabel = css`
  align-self: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const resourceNavList = css`
  background: #fff;
  position: relative;

  &:after {
    content: "";
    width: 1px;
    background: transparent;
    z-index: 1;
    border-left: 2px dashed #ccc;
    position: absolute;
    top: 1.75em;
    left: 1.35em;
    bottom: 1.75em;
  }

  &[data-collapsed="true"] {
    ${resourceNavListItem} {
      display: none;
    }
    ${resourceNavListItem}[data-active="true"] {
      display: grid;
    }
  }
`;

import { scss as css } from "@acab/ecsstatic";

const menuOuter = css`
  position: relative;
`;

const buttonReset = css`
  border: none;
  outline: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  font-size: inherit;
  color: inherit;
  cursor: pointer;
  &:hover {
    color: inherit;
  }
`;

const container = css`
  position: absolute;
  background: #ffffff;
  border: 1px solid #cdcdcd;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  padding: 0.25em;
  list-style: none;
  margin: 0;
  min-width: 0;
`;

const sectionLabel = css`
  font-size: 0.8em;
  color: #9e9e9e;
  font-weight: 500;
  padding: 0.25em;
`;

const itemContainer = css`
  background: #fff;
  border-radius: 3px;
  display: flex;
  font-size: 0.875em;

  &:has(> button) {
    &:hover,
    &:has(:focus) {
      background: #e8f0fe;
    }
  }
`;

const itemIcon = css`
  display: flex;
  align-items: center;
  padding: 0 0.25em;
  & > svg {
    width: 0.9em;
  }
`;

const iconAction = css`
  display: flex;
  align-items: center;
  padding: 0.65em;
  border-radius: 3px;
  &:hover,
  &:focus {
    background: #e8f0fe;
  }
  &:focus {
    outline: 2px solid #bfd1ed;
  }
  & > svg {
    width: 0.8em;
  }
`;

const actionButton = css`
  flex: 1;
  text-align: left;
  padding: 0.65em;
  height: 2.4em;
  border-radius: 3px;
  display: flex;

  &:focus {
    outline: 2px solid #bfd1ed;
  }
`;

const splitItem = css`
  flex: 1;
  text-align: left;
  height: 2.4em;
  display: flex;
  align-items: center;
`;

const itemLabel = css`
  flex: 1;
  padding: 0 0.25em;
  padding-right: 1em;

  &[data-running="true"] {
    color: #999;
  }
`;

const itemLink = css`
  color: #4295e9;
  text-decoration: underline;
  padding: 0 0.5em;
  &:focus {
    outline: 2px solid #bfd1ed;
  }
`;

const itemHotkey = css`
  font-weight: 300;
  font-size: 0.875em;
  color: #9e9e9e;
`;

const divider = css`
  background: red;
  margin-top: 0.25em;
  margin-bottom: 0.25em;
  margin-left: -0.25em;
  margin-right: -0.25em;
  height: 1px;
  background: #cdcdcd;
  border: none;
`;

export const appDropdownStyles = {
  menuOuter,
  buttonReset,
  container,
  sectionLabel,
  itemContainer,
  itemIcon,
  splitItem,
  iconAction,
  actionButton,
  itemLabel,
  itemLink,
  itemHotkey,
  divider,
};

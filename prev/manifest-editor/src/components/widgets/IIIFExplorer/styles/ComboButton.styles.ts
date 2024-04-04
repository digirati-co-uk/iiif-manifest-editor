import { scss as css } from "@acab/ecsstatic";

export const ComboButtonContainer = css`
  --combo-bg: #487af6;
  --combo-bg-hover: #5d85f1;

  display: inline-flex;
  position: relative;
  border-radius: 3px;

  @container main (min-width: 400px) {
    font-size: 0.75em;
  }
`;

export const ComboButtonMain = css`
  padding: 0.5em 1em;
  color: #fff;
  min-width: 4em;

  cursor: pointer;
  appearance: none;
  background: var(--combo-bg);
  border: none;

  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 3px 0px 0px 3px;

  &:disabled {
    opacity: 0.7;
    pointer-events: none;
  }

  &[data-only="true"] {
    border-radius: 3px;
  }

  &:hover {
    background: var(--combo-bg-hover);
  }

  &:active {
    box-shadow: inset 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }
`;

export const ComboButtonChoice = css`
  padding: 0.5em;
  background: var(--combo-bg);
  color: #000;

  display: inline-flex;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: 0px 3px 3px 0px;
  border-left: 1px solid #3360cc;
  white-space: nowrap;

  & > svg {
    fill: #fff;

    inline-size: 1.5ch;
    box-sizing: content-box;
    transition: transform 300ms;
  }

  &:is(:hover, :focus-visible) {
    /* ?? */
  }

  &:active > svg {
    transform: rotate(-25deg);
  }

  &[aria-expanded="true"] {
    background: var(--combo-bg-hover);

    & > svg {
      transform: rotate(180deg);
    }
    &:active > svg {
      transform: rotate(205deg);
    }
  }

  &:active {
    background: var(--combo-bg-hover);
    box-shadow: inset 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }
`;

export const ComboButtonOverlay = css`
  opacity: 0;
  pointer-events: none;
  z-index: 99;

  position: absolute;
  bottom: 90%;
  right: 0;

  list-style-type: none;
  background: #fff;
  color: #000;
  padding-inline: 0;
  padding-block: 0.5ch;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: 0.9em;
  border-radius: 3px;

  box-shadow: 0px 1px 3px 0 rgba(0, 0, 0, 0.3);

  //display: none;
  &[data-open="true"] {
    transition-duration: 200ms;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

export const ComboButtonOption = css``;

export const ComboButtonOptionButton = css`
  display: block;
  padding: 0.5em 1em;
  white-space: nowrap;

  &:focus-visible {
    background: #e6effd;
  }

  &:hover {
    background: #e6effd;
  }
`;

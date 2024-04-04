import { scss as css } from "@acab/ecsstatic";

export const mainContainer = css`
  display: contents;

  &:has([data-float="true"]):before {
    content: "";
    position: fixed;
    top: 0;
    z-index: 99998;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
  }
`;

export const hoverCardContainer = css`
  background: #ffffff;
  border: 1px solid #ced4d9;
  box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
  display: flex;
  container: main-c/size;
  resize: both;
  width: 100%;
  max-width: 100%;
  min-height: 12em;
  min-width: 20em;
  height: 100%;

  &[data-window="false"] {
    box-shadow: none;
    border-radius: 0;
    border: none;
  }

  &[data-float="true"][style] {
    width: auto !important;
    height: auto !important;
  }
  &[data-float="true"] {
    /* Floaty styles */
    position: fixed;
    left: 1.5em;
    right: 1.5em;
    bottom: 1.5em;
    top: 1.5em;
    width: auto;
    height: auto;
    z-index: 99999;
    resize: none;
  }
`;
export const hoverCardHeader = css`
  border-bottom: 1px solid #ddd;
  display: flex;
  padding: 0 0.4em;
  align-items: center;
  flex: 0;
`;
export const hoverCardLabel = css`
  font-weight: 500;
  flex: 1;
  font-size: 0.9em;
  margin: 0.4em 0;
`;
export const hoverCardAction = css`
  padding: 0.15em 0.5em;
  border-radius: 3px;

  &:hover {
    background: #eee;
  }
`;

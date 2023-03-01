import { scss as css } from "@acab/ecsstatic";

export const mainContainer = css``;

export const testCard = css`
  color: red;

  @container main (min-width: 400px) {
    color: lightblue;
  }
`;

export const hoverCardContainer = css`
  background: #ffffff;
  border: 1px solid #ced4d9;
  box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  margin: 1em;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;

  //
  container: main-c/size;
  resize: both;
  width: 640px;
  height: 480px;
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

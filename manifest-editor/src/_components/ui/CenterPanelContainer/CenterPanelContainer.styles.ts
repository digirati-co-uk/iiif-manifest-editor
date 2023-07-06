import { scss as css } from "@acab/ecsstatic";

export const CenterPanelContainer = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: #fff;
  margin: 1.2rem;
  padding: 1em;
  border-radius: 10px;
  box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.18), 0 0px 0px 1px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
`;

export const CenterPanelHeader = css`
  height: 3em;
  display: flex;
  align-items: center;
  margin-bottom: 1em;
`;

export const CenterPanelClose = css`
  margin-left: auto;
  align-self: center;
`;

export const CenterPanelTitle = css`
  margin: 0;
`;

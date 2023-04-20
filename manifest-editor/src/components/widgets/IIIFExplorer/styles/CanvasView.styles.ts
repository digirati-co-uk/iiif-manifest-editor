import { scss as css } from "@acab/ecsstatic";

export const CanvasContainer = css`
  display: flex;
  flex: 1 1 0px;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  & .atlas-container {
    min-width: 0;
    min-height: 0;
    --atlas-container-flex: 1 1 0px;
    --atlas-background: #e5e7f0;
  }

  @container (max-width: 400px) {
    & button[data-control="next"],
    & button[data-control="previous"] {
      display: none;
    }
  }
`;

import { scss as css } from "@acab/ecsstatic";

export const ghostLoadingBlock = css`
  &[data-header="true"] {
    box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.17), inset 0 1px 0 0 rgba(0, 0, 0, 0.17);
  }

  display: block;
  width: 100%;
  height: 2.8em;
  margin-bottom: 1em;
  background-color: #e4e7f0;
  animation: ghost-loading 2s infinite ease-in-out;
  @keyframes ghost-loading {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 0.4;
    }
  }
`;

export const ghostBlockList = css`
  padding: 1em;
  display: flex;
  flex-direction: column;
`;

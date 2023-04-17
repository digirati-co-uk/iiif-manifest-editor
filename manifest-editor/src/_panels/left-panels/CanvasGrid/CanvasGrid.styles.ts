import { scss as css } from "@acab/ecsstatic";

const Container = css`
  padding: 0.875em;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-icon-size, 130px), 1fr));
  justify-content: space-between;
  background-color: inherit;
  gap: 0.875em;
  width: 100%;
  cursor: pointer;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Row = css`
  /* background: green; */
`;

const Item = css`
  img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
`;

export const canvasGridStyles = { Container, Item, Row };

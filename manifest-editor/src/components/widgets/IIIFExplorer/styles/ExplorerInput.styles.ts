import { scss as css } from "@acab/ecsstatic";

export const InputContainer = css`
  display: flex;
  border-bottom: 1px solid #ddd;
  font-size: 0.875em;
  @container (min-width: 400px) {
    font-size: 1em;
  }
`;

export const Input = css`
  border: none;
  background: #fff;
  padding: 0.5em;
  font-size: 1em;
  width: 100%;
`;

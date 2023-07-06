import { scss as css } from "@acab/ecsstatic";

export const datePickerStyles = css`
  display: flex;
  font-size: 0.875em;
  width: 100%;
  background: #f8f9fa;
  border: none;
  padding: 0.4em;
  margin: 0;
  border-bottom: 1px solid #cad0d5;
  text-align: left;
  align-items: center;

  &:focus {
    outline: none;
    background: #eceef5;
  }

  &:has(input:focus),
  &:has(button:focus) {
    outline: none;
    background: #eceef5;
  }

  .react-datetime-picker__wrapper {
    border: none;
  }
`;

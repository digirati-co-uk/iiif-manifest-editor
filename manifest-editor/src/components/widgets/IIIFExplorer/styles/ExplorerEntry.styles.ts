import { scss as css } from "@acab/ecsstatic";

export const SectionLabel = css`
  padding: 0.5em;
  flex: 1;
`;

export const UrlContainer = css`
  padding: 2em 0.5em;

  & > form {
    border: 1px solid #ddd;
    border-radius: 3px;
    overflow: hidden;
  }
`;

export const Section = css`
  display: flex;
  border-bottom: 1px solid #eee;
  border-top: 1px solid #eee;
`;

export const SectionAction = css`
  border: none;
  background: #eee;
  color: #000;
  align-self: center;
  font-size: 0.9em;
  padding: 0.3em 0.5em;
  margin: 0.2em;
  border-radius: 3px;

  &:hover {
    background: #ddd;
  }
`;

export const UrlLabel = css`
  margin-bottom: 0.5em;
  display: block;
`;

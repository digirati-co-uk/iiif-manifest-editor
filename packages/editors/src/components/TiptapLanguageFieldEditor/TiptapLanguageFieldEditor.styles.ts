import styled, { css } from "styled-components";

const main = (props: { theme: any }) => props.theme?.color?.main || "#b84c74";

// Shared with the empty "Add value" placeholder so both render identically.
export const fieldText = css`
  font-size: 0.875em;
  line-height: 1.5;
  padding: 0.8em;
  color: rgba(0, 0, 0, 0.87);
`;

export const placeholderColor = "#6b7280";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  font-size: 1em;
`;

export const ConformityNote = styled.p`
  margin: 0.25rem 0 0;
  color: ${placeholderColor};
  font-size: 0.75rem;
  line-height: 1.4;
`;

/**
 * The single box that holds the input, the formatting toolbar and the
 * language/format options. Matches the flat, bottom-bordered inputs used
 * across the editor.
 */
export const FieldShell = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #f8f9fa;
  border-bottom: 1px solid #cad0d5;
  text-align: left;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:focus-within {
    background: #eceef5;
    border-bottom-color: ${main};
  }
`;

export const FieldRow = styled.div<{ $singleLine?: boolean }>`
  display: flex;
  align-items: ${(props) => (props.$singleLine ? "center" : "flex-start")};
  min-width: 0;
`;

const inputReset = css`
  ${fieldText}
  flex: 1;
  min-width: 0;
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  font-family: inherit;

  &::placeholder {
    color: ${placeholderColor};
    opacity: 1;
  }

  &:focus {
    outline: none;
  }
`;

export const TextInput = styled.textarea<{ $source?: boolean }>`
  ${inputReset}
  resize: none;
  overflow-y: hidden;

  ${(props) =>
    props.$source &&
    css`
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.8em;
      line-height: 1.6;
      padding: 1em;
      min-height: 7em;
      color: #1f2937;
    `}
`;

export const SingleLineInput = styled.input`
  ${inputReset}
`;

/** Lives inside the field, top-right; opens the language & format options. */
export const OptionsButton = styled.button`
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  height: 1.75rem;
  margin: 0.35rem 0.35rem 0.35rem 0;
  padding: 0 0.4rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
  font: inherit;
  font-size: 0.75em;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.1s,
    color 0.1s;

  svg {
    width: 1.35em;
    height: 1.35em;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #111827;
  }

  &:focus-visible {
    outline: 2px solid ${main};
    outline-offset: -2px;
  }

  &[aria-expanded="true"] {
    background: rgba(0, 0, 0, 0.08);
    color: ${main};
  }
`;

const strip = css`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.15rem;
  min-width: 0;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  font-size: 0.8rem;
  line-height: 1;
`;

/** Formatting controls, docked to the bottom of the field while editing HTML. */
export const FormatToolbar = styled.div<{ $visible?: boolean }>`
  ${strip}
  display: none;
  padding: 0.25rem 0.3rem;
  gap: 0;

  ${FieldShell}:focus-within & {
    display: flex;
  }

  ${(props) =>
    props.$visible &&
    css`
      display: flex;
    `}
`;

export const ToolbarSpacer = styled.div`
  flex: 1;
`;

export const ToolbarLabel = styled.span`
  padding: 0 0.4rem;
  color: #6b7280;
  font-weight: 500;
`;

/** Language and format options, revealed by the options button. */
export const OptionsPanel = styled.div`
  ${strip}
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: rgba(255, 255, 255, 0.55);
`;

export const Segmented = styled.div`
  display: inline-flex;
  padding: 2px;
  border-radius: 6px;
  background: rgba(17, 24, 39, 0.07);
`;

export const SegmentButton = styled.button`
  height: 1.6rem;
  padding: 0 0.75rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #4b5563;
  font: inherit;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: #111827;
  }

  &:focus-visible {
    outline: 2px solid ${main};
    outline-offset: -2px;
  }

  &[aria-pressed="true"] {
    background: #fff;
    color: #111827;
    font-weight: 600;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(0, 0, 0, 0.04);
  }
`;

export const LanguageLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
  color: #6b7280;
`;

export const LanguageSelect = styled.select`
  height: 1.75rem;
  padding: 0 0.4rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #111827;
  font: inherit;

  &:focus {
    border-color: ${main};
    outline: none;
  }
`;

export const TextButton = styled.button`
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.5rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #4b5563;
  font: inherit;
  cursor: pointer;
  white-space: nowrap;

  svg {
    width: 1.1em;
    height: 1.1em;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #111827;
  }

  &:focus-visible {
    outline: 2px solid ${main};
    outline-offset: -2px;
  }
`;

export const RemoveButton = styled(TextButton)`
  &:hover {
    background: #fdecec;
    color: #b42318;
  }
`;

export const EditorWrap = styled.div<{ $singleLine?: boolean }>`
  flex: 1;
  min-width: 0;
  position: relative;

  .tiptap {
    ${fieldText}
    background: transparent;
    min-height: ${(props) => (props.$singleLine ? "0" : "4.5em")};
    outline: none;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-family: inherit;
  }

  .tiptap.prose {
    max-width: none;
  }

  /* Paragraphs: a comfortable full line-height of space between them */
  .tiptap p {
    margin-top: 0;
    margin-bottom: 0.75em;
    line-height: 1.5;
  }

  .tiptap p:last-child {
    margin-bottom: 0;
  }

  /* Headings: breathe above, sit close to what they introduce below */
  .tiptap h1,
  .tiptap h2,
  .tiptap h3,
  .tiptap h4 {
    margin-top: 1.6em;
    margin-bottom: 0.4em;
    line-height: 1.25;
  }

  /* First heading needs no top breathing room */
  .tiptap h1:first-child,
  .tiptap h2:first-child,
  .tiptap h3:first-child,
  .tiptap h4:first-child {
    margin-top: 0;
  }

  /* Heading immediately after another heading — less gap */
  .tiptap h1 + h2,
  .tiptap h2 + h3,
  .tiptap h3 + h4 {
    margin-top: 0.75em;
  }

  .tiptap h1 {
    font-size: 1.65em;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.02em;
  }

  .tiptap h2 {
    font-size: 1.3em;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.015em;
  }

  .tiptap h3 {
    font-size: 1.1em;
    font-weight: 600;
    color: #374151;
    letter-spacing: -0.01em;
  }

  .tiptap a {
    color: #b84c74;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    text-decoration-thickness: 1px;
  }

  .tiptap a:hover {
    color: #892c4e;
  }

  /* Lists: margin from surrounding text, sensible indent, item breathing room */
  .tiptap ul,
  .tiptap ol {
    margin-top: 0.25em;
    margin-bottom: 1em;
    padding-left: 1.6em;
  }

  .tiptap ul:last-child,
  .tiptap ol:last-child {
    margin-bottom: 0;
  }

  .tiptap ul {
    list-style: disc;
  }

  .tiptap ol {
    list-style: decimal;
  }

  .tiptap li {
    margin-top: 0.3em;
    margin-bottom: 0.3em;
    line-height: 1.5;
  }

  .tiptap li:first-child {
    margin-top: 0;
  }

  .tiptap li:last-child {
    margin-bottom: 0;
  }

  .tiptap li p {
    margin: 0;
  }

  /* Nested lists */
  .tiptap li > ul,
  .tiptap li > ol {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }

  /* Blockquote: generous side breathing, italic voice */
  .tiptap blockquote {
    margin: 1.25em 0;
    padding: 0.1em 0 0.1em 1.1em;
    border-left: 3px solid #b84c74;
    color: #6b7280;
    font-style: italic;
  }

  .tiptap blockquote:first-child {
    margin-top: 0;
  }

  .tiptap blockquote:last-child {
    margin-bottom: 0;
  }

  .tiptap blockquote p {
    margin: 0;
  }

  .tiptap code {
    border-radius: 4px;
    background: #fdf2f6;
    color: #b84c74;
    padding: 0.15em 0.35em;
    font-size: 0.88em;
    font-family: ui-monospace, monospace;
  }

  .tiptap pre {
    background: #1e293b;
    color: #e2e8f0;
    border-radius: 8px;
    padding: 0.85em 1em;
    margin-bottom: 1em;
    overflow-x: auto;
    line-height: 1.6;
  }

  .tiptap pre:last-child {
    margin-bottom: 0;
  }

  .tiptap pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: 1em;
  }

  .tiptap img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1em 0;
    border-radius: 6px;
  }

  .tiptap img:first-child {
    margin-top: 0;
  }

  .tiptap img:last-child {
    margin-bottom: 0;
  }

  .tiptap img.ProseMirror-selectednode {
    outline: 2px solid #b84c74;
    outline-offset: 2px;
  }

  .tiptap p.is-editor-empty:first-child::before {
    color: ${placeholderColor};
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .tiptap strong {
    font-weight: 700;
    color: #111827;
  }

  .tiptap em {
    font-style: italic;
  }
`;

export const MenuButton = styled.button<{ $active?: boolean }>`
  min-width: 1.7rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.3rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #4b5563;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.1s,
    color 0.1s;

  svg {
    width: 1.15em;
    height: 1.15em;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #111827;
  }

  &:focus-visible {
    outline: 2px solid ${main};
    outline-offset: -2px;
  }

  ${(props) =>
    props.$active &&
    css`
      background: #fff;
      color: ${main(props)};
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

      &:hover {
        background: #fff;
      }
    `}
`;

export const MenuSeparator = styled.div`
  align-self: stretch;
  width: 1px;
  margin: 0.3rem 0.15rem;
  background: rgba(17, 24, 39, 0.1);
`;

export const BlockSelect = styled.select`
  height: 1.75rem;
  max-width: 8.5em;
  padding: 0 0.15rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #374151;
  font: inherit;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${main};
    outline-offset: -2px;
  }
`;

export const MenuForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
`;

export const MenuInput = styled.input`
  min-width: 0;
  flex: 1;
  height: 1.85rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #111827;
  font: inherit;
  padding: 0 0.5rem;

  &:focus {
    border-color: ${main};
    outline: none;
  }
`;

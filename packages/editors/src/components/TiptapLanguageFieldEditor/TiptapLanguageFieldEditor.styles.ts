import { ButtonReset } from "@manifest-editor/ui/atoms/Button";
import styled, { css } from "styled-components";

export const EmptyLanguageField = styled(ButtonReset as any)`
  padding: 0.8em 1em;
  background: #f8f9fa;
  color: #999;
  font-size: 0.9em;
  border-bottom: 1px solid rgba(5, 42, 68, 0.2);
  margin: 0.5em 0 2.18em;
  display: block;
  text-align: left;
  width: 100%;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  font-size: 1em;
`;

export const TopControls = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.35em;
  min-height: 1.9em;
  margin-bottom: 0.35em;
`;

export const TopLanguageSelect = styled.select`
  height: 1.9em;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #4b5563;
  font: inherit;
  font-size: 0.78em;
  padding: 0 0.5em;

  &:focus {
    border-color: #b84c74;
    outline: none;
  }
`;

export const TopIconButton = styled.button`
  width: 1.9em;
  height: 1.9em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #4b5563;
  cursor: pointer;

  svg {
    width: 0.95em;
    height: 0.95em;
  }

  &:hover {
    background: #f9fafb;
    color: #111827;
  }

  &:focus-visible {
    border-color: #b84c74;
    outline: none;
  }
`;

export const FieldShell = styled.fieldset<{ $focus?: boolean; $disabled?: boolean }>`
  display: flex;
  font-size: 1em;
  width: 100%;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: left;
  align-items: stretch;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  padding: 0;
  margin: 0;

  ${(props) =>
    props.$focus &&
    css`
      background: #fff;
      border-color: ${props.theme.color.main || "#b84c74"};
      box-shadow: 0 0 0 3px
        ${props.theme.color.main
        ? props.theme.color.main + "22"
        : "rgba(184,76,116,0.13)"
      };
    `}

  ${(props) =>
    props.$disabled &&
    css`
      pointer-events: none;
      opacity: 0.65;
    `}
`;

export const TextInput = styled.textarea`
  color: rgba(0, 0, 0, 0.87);
  background: #fff;
  flex: 1;
  border: none;
  font-size: 1rem;
  line-height: 1.55;
  padding: 0.8em;
  font-family: inherit;
  margin: 0;
  min-height: 2.95em;
  resize: none;
  overflow-y: hidden;

  &:focus {
    outline: none;
  }
`;

export const SingleLineInput = styled.input`
  color: rgba(0, 0, 0, 0.87);
  background: #fff;
  flex: 1;
  border: none;
  font-size: 1rem;
  line-height: 1.55;
  padding: 0.8em;
  font-family: inherit;
  margin: 0;
  min-width: 0;

  &:focus {
    outline: none;
  }
`;

export const EditorWrap = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;

  .tiptap {
    color: #1a1a2e;
    background: transparent;
    padding: 1em 1.1em;
    min-height: 7em;
    font-size: 1rem;
    line-height: 1.75;
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
    margin-bottom: 1em;
    line-height: 1.75;
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
    line-height: 1.7;
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
    line-height: 1.75;
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
    color: #9ca3af;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    font-style: italic;
  }

  .tiptap strong {
    font-weight: 700;
    color: #111827;
  }

  .tiptap em {
    font-style: italic;
  }
`;

export const ToolbarContainer = styled.div<{ $visible?: boolean }>`
  background: #fff;
  display: flex;
  align-items: center;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s;
  border: none;

  ${(props) =>
    props.$visible &&
    css`
      max-height: 2.2em;
      border: 1px solid #c9cfd5;
    `}
`;

export const ToolbarItem = styled.button<{ $active?: boolean }>`
  height: 1.9em;
  min-width: 1.9em;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.45em;
  border: none;
  border-left: 1px solid #c9cfd5;
  background: #fff;
  color: #28323c;
  font: inherit;
  font-size: 0.875em;
  cursor: pointer;

  &:first-child {
    border-left: none;
  }

  &:hover {
    background: #eee;
  }

  ${(props) =>
    props.$active &&
    css`
      background: #daedfa;

      &:hover {
        background: #daedfa;
      }
    `}
`;

export const ToolbarSelectWrap = styled.div`
  height: 1.9em;
  display: flex;
  align-items: center;
  border-left: 1px solid #c9cfd5;

  select {
    height: 100%;
    border: none;
    background: #fff;
    font: inherit;
    font-size: 0.875em;
    padding: 0 0.4em;
  }
`;

export const ToolbarSpacer = styled.div`
  flex: 1;
`;

export const LanguageDisplay = styled.button`
  width: calc(1.9em + 1px);
  border: none;
  border-left: 1px solid #e8e8e8;
  cursor: pointer;
  align-self: stretch;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e9eaeb;
  }
`;

export const LanguageDisplayInner = styled.span`
  font-size: 0.6em;
  background: rgba(0, 0, 0, 0.06);
  color: #606060;
  font-weight: 600;
  border-radius: 3px;
  text-transform: uppercase;
  padding: 0.5em;
  text-align: center;
`;

export const FormattingToggle = styled(LanguageDisplay)`
  svg,
  img {
    opacity: 0.6;
  }

  &:hover svg,
  &:hover img {
    opacity: 0.9;
  }
`;

export const ContextMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 0.1em;
  max-width: min(92vw, 36rem);
  padding: 0.2em;
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 8px;
  background: #fff;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.07),
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.04);
  color: #1f2937;
  font-size: 0.82rem;
  line-height: 1;
  z-index: 20;
`;

export const MenuButton = styled.button<{ $active?: boolean }>`
  min-width: 2em;
  height: 2em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
  padding: 0 0.55em;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #374151;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s, color 0.1s;

  svg {
    width: 1em;
    height: 1em;
  }

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }

  &:focus-visible {
    outline: 2px solid #b84c74;
    outline-offset: 1px;
  }

  ${(props) =>
    props.$active &&
    css`
      background: #f8ebf1;
      color: #892c4e;

      &:hover {
        background: #f1d6e5;
      }
    `}
`;

export const MenuSeparator = styled.div`
  align-self: stretch;
  width: 1px;
  margin: 0.2em;
  background: #e5e7eb;
`;

export const MenuForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.25em;
  min-width: min(90vw, 22rem);
`;

export const MenuInput = styled.input`
  min-width: 0;
  flex: 1;
  height: 2em;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #111827;
  font: inherit;
  padding: 0 0.55em;

  &:focus {
    border-color: #b84c74;
    outline: none;
  }
`;

export const FloatingActionOuterContainer = styled.div`
  position: relative;
`;

export const FloatingActionContainer = styled.div`
  position: absolute;
  z-index: 2;
  background: #ffffff;
  border: 1px solid #c9cfd5;
  border-top: none;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.07);
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
`;

export const FloatingActionInput = styled.input`
  background: #fff;
  font-size: 0.875em;
  padding: 0.2em 0.4em;
  flex: 1;
  border: none;
  display: block;
  min-width: 0;

  &:focus {
    outline: none;
  }
`;

export const FloatingActionButton = styled.button`
  background: #ddd;
  border-radius: 3px;
  color: #333;
  border: none;
  margin: 0.3em;
  padding: 0.3em;
  white-space: nowrap;

  &:hover {
    background: #ccc;
  }
`;

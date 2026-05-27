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
  background: #fff;
  border: none;
  padding: 0;
  margin: 0;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: left;
  align-items: stretch;

  ${(props) =>
    props.$focus &&
    css`
      background: #fff;
      border-color: ${props.theme.color.main || "#b84c74"};
      box-shadow: 0 0 0 1px ${props.theme.color.main || "#b84c74"};
    `}

  ${(props) =>
    props.$disabled &&
    css`
      pointer-events: none;
      opacity: 0.8;
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
    color: rgba(0, 0, 0, 0.87);
    background: #fff;
    padding: 0.9em 1em;
    min-height: 3.4em;
    font-size: 1rem;
    line-height: 1.55;
    outline: none;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .tiptap.prose {
    max-width: none;
  }

  .tiptap p {
    margin: 0 0 0.65em;
  }

  .tiptap p:last-child,
  .tiptap ul:last-child,
  .tiptap ol:last-child,
  .tiptap blockquote:last-child {
    margin-bottom: 0;
  }

  .tiptap h1,
  .tiptap h2,
  .tiptap h3 {
    color: #111827;
    font-weight: 650;
    line-height: 1.2;
    margin: 0.9em 0 0.4em;
  }

  .tiptap h1:first-child,
  .tiptap h2:first-child,
  .tiptap h3:first-child {
    margin-top: 0;
  }

  .tiptap h1 {
    font-size: 1.45em;
  }

  .tiptap h2 {
    font-size: 1.28em;
  }

  .tiptap h3 {
    font-size: 1.12em;
  }

  .tiptap a {
    color: #3498db;
    text-decoration: underline;
    text-underline-offset: 0.12em;
  }

  .tiptap ul,
  .tiptap ol {
    margin: 0.45em 0 0.7em 1.45em;
    padding: 0 0 0 0.2em;
  }

  .tiptap ul {
    list-style: disc;
  }

  .tiptap ol {
    list-style: decimal;
  }

  .tiptap li {
    margin: 0.2em 0;
    padding-left: 0.1em;
  }

  .tiptap li p {
    margin: 0.1em 0;
  }

  .tiptap blockquote {
    margin: 0.7em 0;
    padding: 0.1em 0 0.1em 0.9em;
    border-left: 3px solid #b84c74;
    color: #4f5963;
    font-style: italic;
  }

  .tiptap code {
    border-radius: 3px;
    background: rgba(5, 42, 68, 0.08);
    padding: 0.1em 0.25em;
    font-size: 0.9em;
  }

  .tiptap img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0.8em 0;
    border-radius: 6px;
  }

  .tiptap img.ProseMirror-selectednode {
    outline: 2px solid #b84c74;
    outline-offset: 2px;
  }

  .tiptap p.is-editor-empty:first-child::before {
    color: #8b949e;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
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
  gap: 0.15em;
  max-width: min(92vw, 34rem);
  padding: 0.25em;
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 6px;
  background: #fff;
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.14),
    0 2px 6px rgba(15, 23, 42, 0.08);
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
  border-radius: 4px;
  background: transparent;
  color: #26313d;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  svg {
    width: 1em;
    height: 1em;
  }

  &:hover {
    background: #f3f4f6;
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

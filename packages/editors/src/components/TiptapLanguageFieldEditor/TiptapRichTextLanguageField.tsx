import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extensions/placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Textarea from "react-textarea-autosize";
import { useDebounce } from "tiny-use-debounce";
import * as S from "./TiptapLanguageFieldEditor.styles";

export interface TiptapRichTextLanguageFieldProps {
  id?: string;
  language: string;
  value: string;
  disableMultiline?: boolean;
  onUpdate: (value: string) => void;
  onRemove?: () => void;
  languages?: string[];
  onUpdateLanguage?: (lang: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disallowHTML?: boolean;
  autoFocus?: boolean;
  allowedBlocks?: Array<"h1" | "h2" | "h3" | "bulletList" | "orderedList" | "blockquote" | "image">;
}

type EditorMode = "text" | "rich";

function isHtmlValue(value: string) {
  return (value || "").trimStart()[0] === "<";
}

function textToHtml(value: string) {
  const escaped = DOMPurify.sanitize(value || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>") || "<br>"}</p>`)
    .join("");
}

function stripHtml(value: string) {
  return DOMPurify.sanitize((value || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p/gi, "</p>\n<p"), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

// Toolbar icons – inline SVGs so we control size and currentColor inheritance
function BoldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
    </svg>
  );
}
function ItalicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
    </svg>
  );
}
function UnderlineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </svg>
  );
}
function BulletListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
    </svg>
  );
}
function OrderedListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
    </svg>
  );
}
function BlockquoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );
}
function ParagraphIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M13 4a4 4 0 0 1 0 8H9v4H7V4h6zm0 6a2 2 0 0 0 0-4H9v4h4z" />
    </svg>
  );
}

function sanitizeHtml(value: string) {
  return DOMPurify.sanitize(value || "", {
    USE_PROFILES: { html: true },
  });
}

export function TiptapRichTextLanguageField(props: TiptapRichTextLanguageFieldProps) {
  const initialValue = props.value || "";
  const initialMode: EditorMode = props.disallowHTML ? "text" : "rich";
  const initialHtml = isHtmlValue(initialValue) ? sanitizeHtml(initialValue) : textToHtml(initialValue);
  const [mode] = useState<EditorMode>(initialMode);
  const [textState, setTextStateInternal] = useState(initialValue);
  const [focus, setFocus] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const textRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const latestValueRef = useRef(props.disallowHTML ? stripHtml(initialValue) : initialHtml);
  const onUpdateRef = useRef(props.onUpdate);
  onUpdateRef.current = props.onUpdate;

  const saveChanges = useCallback(() => {
    onUpdateRef.current(latestValueRef.current);
  }, []);

  const debounceSave = useDebounce(saveChanges, 100);

  const { allowedBlocks } = props;

  const ExitHeadingOnEnter = useMemo(
    () =>
      Extension.create({
        name: "exitHeadingOnEnter",
        addKeyboardShortcuts() {
          return {
            Enter: ({ editor: ed }: { editor: import("@tiptap/core").Editor }) => {
              if (ed.isActive("heading")) {
                const { state } = ed;
                const { $from } = state.selection;
                const endPos = $from.end();
                ed.chain()
                  .focus()
                  .insertContentAt(endPos + 1, { type: "paragraph" })
                  .setTextSelection(endPos + 2)
                  .run();
                return true;
              }
              return false;
            },
          };
        },
      }),
    [],
  );

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: allowedBlocks
          ? {
              levels: (["h1", "h2", "h3"] as const)
                .filter((h): h is "h1" | "h2" | "h3" => !allowedBlocks || allowedBlocks.includes(h))
                .map((h) => Number(h[1]) as 1 | 2 | 3),
            }
          : {},
      }),
      ExitHeadingOnEnter,
      Underline,
      Link.configure({
        openOnClick: false,
        enableClickSelection: true,
        defaultProtocol: "https",
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          loading: "lazy",
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder: "Add value",
      }),
    ],
    [allowedBlocks, ExitHeadingOnEnter],
  );

  const editor = useEditor({
    extensions,
    content: initialMode === "rich" ? initialHtml : textToHtml(initialValue),
    editorProps: {
      attributes: {
        ...(props.id ? { id: props.id } : {}),
        class: "tiptap prose prose-sm max-w-none",
        "aria-label": props.language === "none" ? "Text value" : `${props.language} text value`,
      },
      handleKeyDown: (_view, event) => {
        if (props.disableMultiline && event.key === "Enter") {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor: updatedEditor }) => {
      latestValueRef.current = props.disallowHTML
        ? stripHtml(updatedEditor.getHTML())
        : sanitizeHtml(updatedEditor.getHTML());
      debounceSave();
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => {
      saveChanges();
      setIsFocused(false);
    },
  });

  const setTextState = (value: string) => {
    latestValueRef.current = props.disallowHTML ? stripHtml(value) : value;
    setTextStateInternal(value);
    debounceSave();
  };

  const setIsFocused = (value: boolean) => {
    if (value && props.onFocus) {
      props.onFocus();
    }

    if (!value && props.onBlur) {
      props.onBlur();
    }

    setFocus(value);
  };

  useLayoutEffect(() => {
    if (!props.id) {
      return () => void 0;
    }

    const label = document.querySelector(`label[for="${props.id}"]`);
    if (!label) {
      return () => void 0;
    }

    const listener = () => {
      if (mode === "rich") {
        editor?.commands.focus();
      } else {
        textRef.current?.focus();
      }
    };

    label.addEventListener("click", listener);
    return () => {
      label.removeEventListener("click", listener);
    };
  }, [editor, mode, props.id]);

  useEffect(() => {
    return () => {
      debounceSave.cancel();
      saveChanges();
    };
  }, [debounceSave, saveChanges]);

  useEffect(() => {
    if (props.autoFocus) {
      if (mode === "rich") {
        editor?.commands.focus("end");
      } else {
        textRef.current?.focus();
      }
    }
  }, [editor, mode, props.autoFocus]);

  const currentUrl = editor?.getAttributes("link").href || "";

  const submitLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const link = String(data.get("link") || "").trim();
    const action = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value;

    if (action === "remove" || !link) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: link }).run();
    }

    setShowLinkForm(false);
    debounceSave();
  };

  const submitImage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const src = String(data.get("src") || "").trim();
    const alt = String(data.get("alt") || "").trim();

    if (src) {
      editor
        .chain()
        .focus()
        .setImage({
          src,
          ...(alt ? { alt } : {}),
        })
        .run();
    }

    setShowImageForm(false);
    debounceSave();
  };

  const menuButtonMouseDown = (event: React.MouseEvent) => event.preventDefault();

  const inlineMenus =
    editor && mode === "rich" ? (
      <>
        <BubbleMenu
          editor={editor}
          updateDelay={0}
          options={{ placement: "top", offset: 8, flip: true, shift: true }}
          shouldShow={({ editor: menuEditor, from, to }) => {
            return menuEditor.isEditable && from !== to;
          }}
        >
          <S.ContextMenu role="toolbar" aria-label="Text formatting">
            {showLinkForm ? (
              <S.MenuForm onSubmit={submitLink}>
                <S.MenuInput type="text" name="link" defaultValue={currentUrl} placeholder="https://" autoFocus />
                <S.MenuButton type="submit" name="_action" value="add">
                  Add
                </S.MenuButton>
                <S.MenuButton type="submit" name="_action" value="remove">
                  Remove
                </S.MenuButton>
              </S.MenuForm>
            ) : (
              <>
                <S.MenuButton
                  type="button"
                  title="Bold"
                  aria-label="Bold"
                  $active={editor.isActive("bold")}
                  onMouseDown={menuButtonMouseDown}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <BoldIcon />
                </S.MenuButton>
                <S.MenuButton
                  type="button"
                  title="Italic"
                  aria-label="Italic"
                  $active={editor.isActive("italic")}
                  onMouseDown={menuButtonMouseDown}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <ItalicIcon />
                </S.MenuButton>
                <S.MenuButton
                  type="button"
                  title="Underline"
                  aria-label="Underline"
                  $active={editor.isActive("underline")}
                  onMouseDown={menuButtonMouseDown}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <UnderlineIcon />
                </S.MenuButton>
                <S.MenuSeparator />
                <S.MenuButton
                  type="button"
                  title="Link"
                  aria-label="Link"
                  $active={editor.isActive("link")}
                  onMouseDown={menuButtonMouseDown}
                  onClick={() => setShowLinkForm(true)}
                >
                  <LinkIcon />
                </S.MenuButton>
                <S.MenuSeparator />
                <S.MenuButton
                  type="button"
                  title="Paragraph"
                  aria-label="Paragraph"
                  $active={editor.isActive("paragraph")}
                  onMouseDown={menuButtonMouseDown}
                  onClick={() => editor.chain().focus().setParagraph().run()}
                >
                  <ParagraphIcon />
                </S.MenuButton>
                {(!allowedBlocks || allowedBlocks.includes("h1")) && (
                  <S.MenuButton
                    type="button"
                    title="Heading 1"
                    aria-label="Heading 1"
                    $active={editor.isActive("heading", { level: 1 })}
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  >
                    H1
                  </S.MenuButton>
                )}
                {(!allowedBlocks || allowedBlocks.includes("h2")) && (
                  <S.MenuButton
                    type="button"
                    title="Heading 2"
                    aria-label="Heading 2"
                    $active={editor.isActive("heading", { level: 2 })}
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    H2
                  </S.MenuButton>
                )}
                {(!allowedBlocks || allowedBlocks.includes("h3")) && (
                  <S.MenuButton
                    type="button"
                    title="Heading 3"
                    aria-label="Heading 3"
                    $active={editor.isActive("heading", { level: 3 })}
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    H3
                  </S.MenuButton>
                )}
                {(!allowedBlocks || allowedBlocks.includes("blockquote")) && (
                  <S.MenuButton
                    type="button"
                    title="Quote"
                    aria-label="Quote"
                    $active={editor.isActive("blockquote")}
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    <BlockquoteIcon />
                  </S.MenuButton>
                )}
              </>
            )}
          </S.ContextMenu>
        </BubbleMenu>
        {!props.disableMultiline ? (
          <FloatingMenu
            editor={editor}
            updateDelay={100}
            options={{ placement: "left-start", offset: 8, flip: true, shift: true }}
            shouldShow={({ editor: menuEditor, state }) => {
              const { selection } = state;
              const { $from } = selection;
              return (
                menuEditor.isEditable && selection.empty && $from.parent.isTextblock && $from.parent.content.size === 0
              );
            }}
          >
            <S.ContextMenu role="toolbar" aria-label="Insert block">
              {showImageForm ? (
                <S.MenuForm onSubmit={submitImage}>
                  <S.MenuInput type="url" name="src" placeholder="Image URL" autoFocus />
                  <S.MenuInput type="text" name="alt" placeholder="Alt text" />
                  <S.MenuButton type="submit">Insert</S.MenuButton>
                </S.MenuForm>
              ) : (
                <>
                  <S.MenuButton
                    type="button"
                    title="Paragraph"
                    aria-label="Paragraph"
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().setParagraph().run()}
                  >
                    <ParagraphIcon />
                  </S.MenuButton>
                  {(!allowedBlocks || allowedBlocks.includes("h1")) && (
                    <S.MenuButton
                      type="button"
                      title="Heading 1"
                      aria-label="Heading 1"
                      onMouseDown={menuButtonMouseDown}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                      H1
                    </S.MenuButton>
                  )}
                  {(!allowedBlocks || allowedBlocks.includes("h2")) && (
                    <S.MenuButton
                      type="button"
                      title="Heading 2"
                      aria-label="Heading 2"
                      onMouseDown={menuButtonMouseDown}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                      H2
                    </S.MenuButton>
                  )}
                  {(!allowedBlocks || allowedBlocks.includes("h3")) && (
                    <S.MenuButton
                      type="button"
                      title="Heading 3"
                      aria-label="Heading 3"
                      onMouseDown={menuButtonMouseDown}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                      H3
                    </S.MenuButton>
                  )}
                  {(!allowedBlocks ||
                    allowedBlocks.includes("bulletList") ||
                    !allowedBlocks ||
                    allowedBlocks.includes("orderedList") ||
                    !allowedBlocks ||
                    allowedBlocks.includes("blockquote")) && <S.MenuSeparator />}
                  {(!allowedBlocks || allowedBlocks.includes("bulletList")) && (
                    <S.MenuButton
                      type="button"
                      title="Bullet list"
                      aria-label="Bullet list"
                      onMouseDown={menuButtonMouseDown}
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                      <BulletListIcon />
                    </S.MenuButton>
                  )}
                  {(!allowedBlocks || allowedBlocks.includes("orderedList")) && (
                    <S.MenuButton
                      type="button"
                      title="Numbered list"
                      aria-label="Numbered list"
                      onMouseDown={menuButtonMouseDown}
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                      <OrderedListIcon />
                    </S.MenuButton>
                  )}
                  {(!allowedBlocks || allowedBlocks.includes("blockquote")) && (
                    <S.MenuButton
                      type="button"
                      title="Quote"
                      aria-label="Quote"
                      onMouseDown={menuButtonMouseDown}
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                      <BlockquoteIcon />
                    </S.MenuButton>
                  )}
                  {(!allowedBlocks || allowedBlocks.includes("image")) && (
                    <>
                      <S.MenuSeparator />
                      <S.MenuButton
                        type="button"
                        title="Image"
                        aria-label="Image"
                        onMouseDown={menuButtonMouseDown}
                        onClick={() => setShowImageForm(true)}
                      >
                        <ImageIcon />
                      </S.MenuButton>
                    </>
                  )}
                </>
              )}
            </S.ContextMenu>
          </FloatingMenu>
        ) : null}
      </>
    ) : null;

  return (
    <S.Container>
      {props.onUpdateLanguage && props.languages ? (
        <S.TopControls>
          <S.TopLanguageSelect
            aria-label="Language"
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            value={props.language}
            onChange={(e) => props.onUpdateLanguage?.(e.currentTarget.value)}
          >
            {props.languages.map((lang, n) => (
              <option key={`lang_${lang}_${n}`} value={lang}>
                {lang}
              </option>
            ))}
          </S.TopLanguageSelect>
          {props.onRemove ? (
            <S.TopIconButton type="button" title="Remove" aria-label="Remove" onClick={props.onRemove}>
              <CloseIcon />
            </S.TopIconButton>
          ) : null}
        </S.TopControls>
      ) : props.onRemove ? (
        <S.TopControls>
          <S.TopIconButton type="button" title="Remove" aria-label="Remove" onClick={props.onRemove}>
            <CloseIcon />
          </S.TopIconButton>
        </S.TopControls>
      ) : null}
      <S.FieldShell $focus={focus}>
        {mode === "rich" ? (
          <S.EditorWrap>
            {inlineMenus}
            <EditorContent editor={editor} />
          </S.EditorWrap>
        ) : props.disableMultiline ? (
          <S.SingleLineInput
            id={props.id}
            ref={textRef as React.RefObject<HTMLInputElement>}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              saveChanges();
              setIsFocused(false);
            }}
            value={textState}
            onChange={(e) => setTextState(e.currentTarget.value)}
          />
        ) : (
          <S.TextInput
            id={props.id}
            ref={textRef as React.RefObject<HTMLTextAreaElement>}
            as={Textarea}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              saveChanges();
              setIsFocused(false);
            }}
            value={textState}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextState(e.currentTarget.value)}
          />
        )}
      </S.FieldShell>
    </S.Container>
  );
}

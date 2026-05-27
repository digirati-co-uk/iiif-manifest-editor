import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { LinkIcon } from "@manifest-editor/ui/icons/LinkIcon";
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

  const saveChanges = useCallback(() => {
    props.onUpdate(latestValueRef.current);
  }, [props.onUpdate]);

  const debounceSave = useDebounce(saveChanges, 100);

  const extensions = useMemo(
    () => [
      StarterKit,
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
    [],
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
          updateDelay={100}
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
                  B
                </S.MenuButton>
                <S.MenuButton
                  type="button"
                  title="Italic"
                  aria-label="Italic"
                  $active={editor.isActive("italic")}
                  onMouseDown={menuButtonMouseDown}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  i
                </S.MenuButton>
                <S.MenuButton
                  type="button"
                  title="Underline"
                  aria-label="Underline"
                  $active={editor.isActive("underline")}
                  onMouseDown={menuButtonMouseDown}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  u
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
                  P
                </S.MenuButton>
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
                <S.MenuButton
                  type="button"
                  title="Quote"
                  aria-label="Quote"
                  $active={editor.isActive("blockquote")}
                  onMouseDown={menuButtonMouseDown}
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  &ldquo;
                </S.MenuButton>
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
                    P
                  </S.MenuButton>
                  <S.MenuButton
                    type="button"
                    title="Heading 2"
                    aria-label="Heading 2"
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    H2
                  </S.MenuButton>
                  <S.MenuButton
                    type="button"
                    title="Heading 3"
                    aria-label="Heading 3"
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    H3
                  </S.MenuButton>
                  <S.MenuSeparator />
                  <S.MenuButton
                    type="button"
                    title="Bullet list"
                    aria-label="Bullet list"
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    &bull;
                  </S.MenuButton>
                  <S.MenuButton
                    type="button"
                    title="Numbered list"
                    aria-label="Numbered list"
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  >
                    1.
                  </S.MenuButton>
                  <S.MenuButton
                    type="button"
                    title="Quote"
                    aria-label="Quote"
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    &ldquo;
                  </S.MenuButton>
                  <S.MenuSeparator />
                  <S.MenuButton
                    type="button"
                    title="Image"
                    aria-label="Image"
                    onMouseDown={menuButtonMouseDown}
                    onClick={() => setShowImageForm(true)}
                  >
                    Img
                  </S.MenuButton>
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

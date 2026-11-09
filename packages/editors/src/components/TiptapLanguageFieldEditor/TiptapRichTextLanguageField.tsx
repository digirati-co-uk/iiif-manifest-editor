import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { CloseIcon } from "@manifest-editor/ui/icons/CloseIcon";
import { LanguageIcon } from "@manifest-editor/ui/icons/LanguageIcon";
import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import { Placeholder } from "@tiptap/extensions/placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useId, useMemo, useRef, useState } from "react";
import Textarea from "react-textarea-autosize";
import { useDebounce } from "tiny-use-debounce";
import * as S from "./TiptapLanguageFieldEditor.styles";
import { contentLanguageName } from "../../i18n";
import { htmlToStoredValue, isHtmlValue, textToHtml } from "./text-to-html";

export interface TiptapRichTextLanguageFieldProps {
  ariaLabel?: string;
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

type EditorMode = "text" | "rich" | "source";

function stripHtml(value: string) {
  const element = document.createElement("div");
  element.innerHTML = sanitizeHtml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n");
  return (element.textContent || "").replace(/\n$/, "");
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
function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );
}
function SourceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden>
      <path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  );
}

function sanitizeHtml(value: string) {
  return DOMPurify.sanitize(value || "", {
    USE_PROFILES: { html: true },
  });
}

// Whether converting this HTML to plain text would drop more than paragraphs and line breaks.
function hasFormatting(value: string) {
  return /<(?!\/?(p|br)\b)[a-z]/i.test(value);
}

export function TiptapRichTextLanguageField(props: TiptapRichTextLanguageFieldProps) {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const { locale } = useEditorI18n();
  const [mode, setMode] = useState<EditorMode>(() => (isHtmlValue(props.value || "") ? "rich" : "text"));
  const [value, setValue] = useState(props.value || "");
  const [showOptions, setShowOptions] = useState(false);
  const [focusOnModeChange, setFocusOnModeChange] = useState(false);
  const optionsId = useId();
  const textRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const currentMode = useRef(mode);
  currentMode.current = mode;
  const latestValue = useRef(value);
  const savedValue = useRef(value);
  const previousValue = useRef(props.value);
  const onUpdate = useRef(props.onUpdate);
  onUpdate.current = props.onUpdate;
  const ariaLabel =
    props.ariaLabel ||
    (props.language === "none"
      ? t("ui.textValue")
      : t("messages.textForLanguage", { language: contentLanguageName(props.language, locale, t("language.none")) }));
  const canChangeLanguage = !!(props.onUpdateLanguage && props.languages);
  // Imported HTML remains editable even in fields that should contain plain text.
  // Keep the editor available for the current session until HTML is explicitly removed.
  const canEditHtml = !props.disallowHTML || isHtmlValue(value) || mode !== "text";
  const showConformityNote = props.disallowHTML && (isHtmlValue(value) || mode !== "text");
  const hasOptions = canEditHtml || canChangeLanguage || !!props.onRemove;

  const saveChanges = useCallback(() => {
    if (latestValue.current !== savedValue.current) {
      if (currentMode.current === "source") latestValue.current = sanitizeHtml(latestValue.current);
      if (latestValue.current !== savedValue.current) {
        savedValue.current = latestValue.current;
        onUpdate.current(currentMode.current === "text" ? latestValue.current : htmlToStoredValue(latestValue.current));
      }
    }
  }, []);
  const debounceSave = useDebounce(saveChanges, 100);

  const changeValue = (nextValue: string) => {
    latestValue.current = nextValue;
    setValue(nextValue);
    // Source markup may be incomplete while typing; sanitize and commit on blur.
    if (mode !== "source") debounceSave();
  };

  useLayoutEffect(() => {
    if (props.value !== previousValue.current) {
      previousValue.current = props.value;
      // Ignore our own saves echoing back, including HTML collapsed to plain text.
      const isOwnValue =
        props.value === latestValue.current ||
        (currentMode.current !== "text" && props.value === htmlToStoredValue(latestValue.current));
      if (!isOwnValue) {
        debounceSave.cancel();
        latestValue.current = savedValue.current = props.value || "";
        setValue(latestValue.current);
        setMode(isHtmlValue(latestValue.current) ? "rich" : "text");
      }
    }
  }, [props.value, props.disallowHTML, mode, debounceSave]);

  useEffect(
    () => () => {
      debounceSave.cancel();
      saveChanges();
    },
    [debounceSave, saveChanges]
  );

  useEffect(() => {
    if (mode !== "rich" && (props.autoFocus || focusOnModeChange)) {
      textRef.current?.focus();
    }
  }, [mode, props.autoFocus, focusOnModeChange]);

  const changeMode = (nextMode: EditorMode) => {
    saveChanges();
    setValue(latestValue.current);
    setFocusOnModeChange(true);
    setMode(nextMode);
  };
  const switchToHtml = () => {
    if (mode !== "text" || !canEditHtml) return;
    if (!isHtmlValue(value)) changeValue(textToHtml(value));
    changeMode("rich");
  };
  const removeHtml = () => {
    if (hasFormatting(value) && !window.confirm(t("language.switchPlainConfirm"))) {
      return;
    }
    currentMode.current = "text";
    changeValue(stripHtml(value));
    changeMode("text");
  };
  const onBlur = () => {
    saveChanges();
    setValue(latestValue.current);
    props.onBlur?.();
  };
  const onFocus = () => {
    props.onFocus?.();
  };

  const optionsButton = hasOptions ? (
    <S.OptionsButton
      type="button"
      title={t("ui.languageAndFormat")}
      aria-label={t("messages.fieldOptions", { label: ariaLabel })}
      aria-expanded={showOptions}
      aria-controls={optionsId}
      onClick={() => setShowOptions((open) => !open)}
    >
      <LanguageIcon aria-hidden />
      {props.language && props.language !== "none" ? <span aria-hidden>{props.language}</span> : null}
    </S.OptionsButton>
  ) : null;

  const sourceToggle = (
    <S.MenuButton
      type="button"
      title={mode === "source" ? t("ui.backToFormattedView") : t("ui.editHtmlSource")}
      aria-label={t("ui.htmlSource")}
      aria-pressed={mode === "source"}
      $active={mode === "source"}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => changeMode(mode === "source" ? "rich" : "source")}
    >
      <SourceIcon />
    </S.MenuButton>
  );

  return (
    <S.Container>
      <S.FieldShell
        onKeyDown={(event) => {
          if (event.key === "Escape" && showOptions) setShowOptions(false);
        }}
      >
        {mode === "rich" ? (
          <RichEditor
            {...props}
            value={value}
            ariaLabel={ariaLabel}
            autoFocus={props.autoFocus || focusOnModeChange}
            onUpdate={changeValue}
            onFocus={onFocus}
            onBlur={onBlur}
            trailing={optionsButton}
            toolbarEnd={sourceToggle}
            showToolbar={showOptions}
          />
        ) : (
          <>
            <S.FieldRow $singleLine={mode === "text" && props.disableMultiline}>
              {mode === "text" && props.disableMultiline ? (
                <S.SingleLineInput
                  id={props.id}
                  aria-label={ariaLabel}
                  placeholder={t("ui.addValue")}
                  ref={textRef as React.RefObject<HTMLInputElement>}
                  value={value}
                  onChange={(event) => changeValue(event.currentTarget.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              ) : (
                <S.TextInput
                  id={props.id}
                  aria-label={mode === "source" ? t("messages.fieldSource", { label: ariaLabel }) : ariaLabel}
                  placeholder={mode === "source" ? "<p>HTML</p>" : t("ui.addValue")}
                  spellCheck={mode !== "source"}
                  ref={textRef as React.RefObject<HTMLTextAreaElement>}
                  as={Textarea}
                  $source={mode === "source"}
                  value={value}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => changeValue(event.currentTarget.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              )}
              {optionsButton}
            </S.FieldRow>
            {mode === "source" ? (
              <S.FormatToolbar $visible role="toolbar" aria-label={t("ui.textFormatting")}>
                <S.ToolbarLabel>{t("ui.editingHtmlSource")}</S.ToolbarLabel>
                <S.ToolbarSpacer />
                {sourceToggle}
              </S.FormatToolbar>
            ) : null}
          </>
        )}
        {showOptions ? (
          <S.OptionsPanel id={optionsId}>
            {canEditHtml ? (
              <S.Segmented role="group" aria-label={t("ui.valueFormat")}>
                <S.SegmentButton type="button" aria-pressed={mode === "text"} onClick={removeHtml}>
                  {t("ui.text")}
                </S.SegmentButton>
                <S.SegmentButton type="button" aria-pressed={mode !== "text"} onClick={switchToHtml}>
                  {t("ui.html")}
                </S.SegmentButton>
              </S.Segmented>
            ) : null}
            <S.ToolbarSpacer />
            {canChangeLanguage ? (
              <S.LanguageLabel>
                {t("fields.language")}
                <S.LanguageSelect
                  aria-label={t("messages.fieldLanguage", { label: ariaLabel })}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  value={props.language}
                  onChange={(event) => {
                    saveChanges();
                    props.onUpdateLanguage?.(event.currentTarget.value);
                  }}
                >
                  {props.languages?.map((lang) => (
                    <option key={lang} value={lang}>
                      {contentLanguageName(lang, locale, t("language.none"))}
                    </option>
                  ))}
                </S.LanguageSelect>
              </S.LanguageLabel>
            ) : null}
            {props.onRemove ? (
              <S.RemoveButton
                type="button"
                title={t("ui.removeValue")}
                aria-label={commonT("actions.remove")}
                onClick={props.onRemove}
              >
                <CloseIcon />
              </S.RemoveButton>
            ) : null}
          </S.OptionsPanel>
        ) : null}
      </S.FieldShell>
      {showConformityNote ? <S.ConformityNote>{t("ui.iiifExpectsPlainTextInThisField")}</S.ConformityNote> : null}
    </S.Container>
  );
}

interface RichEditorProps extends TiptapRichTextLanguageFieldProps {
  trailing?: React.ReactNode;
  toolbarEnd?: React.ReactNode;
  showToolbar?: boolean;
}

function RichEditor(props: RichEditorProps) {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const placeholder = useRef(t("ui.addValue"));
  placeholder.current = t("ui.addValue");
  const [form, setForm] = useState<"link" | "image" | null>(null);
  const { allowedBlocks, disableMultiline } = props;
  const allows = (block: NonNullable<TiptapRichTextLanguageFieldProps["allowedBlocks"]>[number]) =>
    !disableMultiline && (!allowedBlocks || allowedBlocks.includes(block));

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
    []
  );

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading:
          allowedBlocks && !allowedBlocks.some((block) => /^h[123]$/.test(block))
            ? false
            : {
                levels: (["h1", "h2", "h3"] as const)
                  .filter((heading) => !allowedBlocks || allowedBlocks.includes(heading))
                  .map((heading) => Number(heading[1]) as 1 | 2 | 3),
              },
        bulletList: allowedBlocks && !allowedBlocks.includes("bulletList") ? false : {},
        orderedList: allowedBlocks && !allowedBlocks.includes("orderedList") ? false : {},
        blockquote: allowedBlocks && !allowedBlocks.includes("blockquote") ? false : {},
        link: { openOnClick: false, enableClickSelection: true, defaultProtocol: "https" },
        // Avoid saving a stray empty paragraph after lists and headings.
        trailingNode: false,
      }),
      ExitHeadingOnEnter,
      ...(!allowedBlocks || allowedBlocks.includes("image")
        ? [
            Image.configure({
              allowBase64: false,
              HTMLAttributes: {
                loading: "lazy",
              },
            }),
          ]
        : []),
      Typography,
      Placeholder.configure({
        placeholder: () => placeholder.current,
      }),
    ],
    [allowedBlocks, ExitHeadingOnEnter]
  );

  const editor = useEditor({
    extensions,
    content: sanitizeHtml(props.value),
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        ...(props.id ? { id: props.id } : {}),
        class: "tiptap prose prose-sm max-w-none",
        "aria-label": props.ariaLabel || t("ui.textValue"),
        role: "textbox",
        "aria-multiline": String(!props.disableMultiline),
      },
      handlePaste: (view, event) => {
        if (!props.disableMultiline || !event.clipboardData) return false;
        const text = event.clipboardData.getData("text/plain").replace(/[\r\n]+/g, " ");
        view.dispatch(view.state.tr.insertText(text));
        return true;
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
    onUpdate: ({ editor: updatedEditor }) => props.onUpdate(sanitizeHtml(updatedEditor.getHTML())),
    onFocus: props.onFocus,
    onBlur: props.onBlur,
  });

  useEffect(() => {
    if (editor && props.value !== editor.getHTML()) {
      editor.commands.setContent(sanitizeHtml(props.value), { emitUpdate: false });
    }
  }, [editor, props.value]);

  useLayoutEffect(() => {
    if (!props.id) return;
    const label = document.querySelector(`label[for="${props.id}"]`);
    const focus = () => editor?.commands.focus();
    label?.addEventListener("click", focus);
    return () => label?.removeEventListener("click", focus);
  }, [editor, props.id]);

  useEffect(() => {
    if (props.autoFocus) editor?.commands.focus("end");
  }, [editor, props.autoFocus]);

  const submitLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;

    const data = new FormData(event.currentTarget);
    const link = String(data.get("link") || "").trim();
    const action = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value;

    if (action === "remove" || !link) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: link }).run();
    }
    setForm(null);
  };

  const submitImage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;

    const data = new FormData(event.currentTarget);
    const src = String(data.get("src") || "").trim();
    const alt = String(data.get("alt") || "").trim();
    if (src) {
      editor
        .chain()
        .focus()
        .setImage({ src, ...(alt ? { alt } : {}) })
        .run();
    }
    setForm(null);
  };

  const closeForm = () => {
    setForm(null);
    editor?.commands.focus();
  };

  // Keep the editor selection when pressing toolbar buttons.
  const keepFocus = (event: React.MouseEvent) => event.preventDefault();

  const markButton = (name: "bold" | "italic" | "underline", label: string, icon: React.ReactNode) =>
    editor ? (
      <S.MenuButton
        type="button"
        title={label}
        aria-label={label}
        $active={editor.isActive(name)}
        aria-pressed={editor.isActive(name)}
        onMouseDown={keepFocus}
        onClick={() => editor.chain().focus().toggleMark(name).run()}
      >
        {icon}
      </S.MenuButton>
    ) : null;

  // Headings, lists and quotes are mutually exclusive block styles, so one compact select covers them all.
  type BlockStyle = "p" | "h1" | "h2" | "h3" | "bulletList" | "orderedList" | "blockquote";
  const blockStyles = (
    [
      ["h1", t("ui.heading1")],
      ["h2", t("ui.heading2")],
      ["h3", t("ui.heading3")],
      ["bulletList", t("ui.bulletList")],
      ["orderedList", t("ui.numberedList")],
      ["blockquote", t("ui.quote")],
    ] as const
  ).filter(([style]) => allows(style));

  const isBlockStyle = (style: BlockStyle) =>
    !!editor && (style[0] === "h" ? editor.isActive("heading", { level: Number(style[1]) }) : editor.isActive(style));
  // Lists and quotes wrap paragraphs, so check them before headings.
  const currentBlock: BlockStyle =
    blockStyles.find(([style]) => style[0] !== "h" && isBlockStyle(style))?.[0] ||
    blockStyles.find(([style]) => isBlockStyle(style))?.[0] ||
    "p";

  const setBlockStyle = (style: BlockStyle) => {
    if (!editor) return;
    const chain = editor.chain().focus().clearNodes();
    if (style === "p") chain.setParagraph().run();
    else if (style === "bulletList") chain.toggleBulletList().run();
    else if (style === "orderedList") chain.toggleOrderedList().run();
    else if (style === "blockquote") chain.toggleBlockquote().run();
    else chain.setHeading({ level: Number(style[1]) as 1 | 2 | 3 }).run();
  };

  let toolbar: React.ReactNode = null;
  if (editor && form === "link") {
    toolbar = (
      <S.MenuForm onSubmit={submitLink} onKeyDown={(event) => event.key === "Escape" && closeForm()}>
        <S.MenuInput
          type="text"
          name="link"
          aria-label={t("ui.linkUrl")}
          defaultValue={editor.getAttributes("link").href || ""}
          placeholder="https://"
          autoFocus
        />
        <S.TextButton type="submit" name="_action" value="add">
          {commonT("actions.apply")}
        </S.TextButton>
        {editor.isActive("link") ? (
          <S.TextButton type="submit" name="_action" value="remove">
            {t("ui.unlink")}
          </S.TextButton>
        ) : null}
        <S.TextButton type="button" onClick={closeForm}>
          {commonT("actions.cancel")}
        </S.TextButton>
      </S.MenuForm>
    );
  } else if (editor && form === "image") {
    toolbar = (
      <S.MenuForm onSubmit={submitImage} onKeyDown={(event) => event.key === "Escape" && closeForm()}>
        <S.MenuInput type="url" name="src" aria-label={t("ui.imageUrl")} placeholder={t("ui.imageUrl")} autoFocus />
        <S.MenuInput type="text" name="alt" aria-label={t("ui.altText")} placeholder={t("ui.altText")} />
        <S.TextButton type="submit">{t("ui.insert")}</S.TextButton>
        <S.TextButton type="button" onClick={closeForm}>
          {commonT("actions.cancel")}
        </S.TextButton>
      </S.MenuForm>
    );
  } else if (editor) {
    toolbar = (
      <>
        {markButton("bold", t("ui.bold"), <BoldIcon />)}
        {markButton("italic", t("ui.italic"), <ItalicIcon />)}
        {markButton("underline", t("ui.underline"), <UnderlineIcon />)}
        <S.MenuButton
          type="button"
          title={t("ui.link")}
          aria-label={t("ui.link")}
          $active={editor.isActive("link")}
          aria-pressed={editor.isActive("link")}
          onMouseDown={keepFocus}
          onClick={() => setForm("link")}
        >
          <LinkIcon />
        </S.MenuButton>
        {blockStyles.length ? (
          <>
            <S.MenuSeparator />
            <S.BlockSelect
              aria-label={t("ui.blockStyle")}
              value={currentBlock}
              onChange={(event) => setBlockStyle(event.currentTarget.value as BlockStyle)}
            >
              <option value="p">{t("ui.paragraph")}</option>
              {blockStyles.map(([style, label]) => (
                <option key={style} value={style}>
                  {label}
                </option>
              ))}
            </S.BlockSelect>
          </>
        ) : null}
        {allows("image") ? (
          <S.MenuButton
            type="button"
            title={t("ui.image")}
            aria-label={t("ui.image")}
            onMouseDown={keepFocus}
            onClick={() => setForm("image")}
          >
            <ImageIcon />
          </S.MenuButton>
        ) : null}
        <S.ToolbarSpacer />
        {props.toolbarEnd}
      </>
    );
  }

  return (
    <>
      <S.FieldRow $singleLine={props.disableMultiline}>
        <S.EditorWrap $singleLine={props.disableMultiline}>
          <EditorContent editor={editor} />
        </S.EditorWrap>
        {props.trailing}
      </S.FieldRow>
      {toolbar ? (
        <S.FormatToolbar $visible={props.showToolbar || !!form} role="toolbar" aria-label={t("ui.textFormatting")}>
          {toolbar}
        </S.FormatToolbar>
      ) : null}
    </>
  );
}

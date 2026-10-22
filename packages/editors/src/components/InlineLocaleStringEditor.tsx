import type { InternationalString } from "@iiif/presentation-3";
import { EditTextIcon } from "@manifest-editor/components";
import type { InternationalStringEditor } from "@manifest-editor/editor-api";
import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { LocaleString, useLocaleString } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { RichTextLanguageField } from "./RichTextLanguageField/RichTextLanguageField";
import { isHtmlValue } from "./TiptapLanguageFieldEditor/text-to-html";

export type LocaleStringProps = {
  as?: string | React.FC<any>;
  defaultText?: string;
  to?: string;
  separator?: string;
  enableDangerouslySetInnerHTML?: boolean;
  children: InternationalString | string | null | undefined;
  style?: React.CSSProperties;
  extraProps?: any;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  editButtonClassName?: string;
};

export interface InlineLocaleStringEditorProps extends LocaleStringProps {
  editor: InternationalStringEditor<any>;
  multiline?: boolean;
}

export function InlineLocaleStringEditor({
  children,
  multiline,
  className,
  editor,
  placeholder,
  buttonClassName,
  editButtonClassName,
  ...props
}: InlineLocaleStringEditorProps) {
  const [value, language] = useLocaleString(children);
  const [isEditing, setIsEditing] = useState(false);
  const [useHtmlEditor, setUseHtmlEditor] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const originalValue = useRef(value);
  const cancelled = useRef(false);

  const [immediateValue, _setImmediateValue] = useState(value);

  const setImmediateValue = (value: string) => {
    if (cancelled.current) return;
    _setImmediateValue(value);
    editor.setValueForLanguage(language || "none", value);
  };

  const beginEditing = () => {
    cancelled.current = false;
    originalValue.current = value;
    _setImmediateValue(value);
    setUseHtmlEditor(editor.getProperty() === "summary" || isHtmlValue(value));
    setIsEditing(true);
  };

  useLayoutEffect(() => {
    if (isEditing) {
      const textarea = editorRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(0, textarea.value.length);
      }
    }
  }, [isEditing]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        // escape key
        if (e.key === "Escape") {
          cancelled.current = true;
          _setImmediateValue(originalValue.current);
          editor.setValueForLanguage(language || "none", originalValue.current);
          setIsEditing(false);
        }
      }}
      className={twMerge(
        "relative group hover:ring-2 ring-me-400 focus-within:ring-2 ring-offset-2 rounded",
        buttonClassName
      )}
    >
      {isEditing ? (
        useHtmlEditor ? (
          <div>
            <RichTextLanguageField
              ariaLabel={placeholder ? `Edit ${placeholder}` : "Edit text"}
              autoFocus
              disableMultiline={!multiline}
              disallowHTML={editor.getProperty() !== "summary"}
              language={language || "none"}
              value={immediateValue}
              onUpdate={setImmediateValue}
            />
            <button
              type="button"
              className="mt-1 px-2 py-1 text-sm"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setIsEditing(false)}
            >
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isEditing) {
                const textarea = editorRef.current;
                if (textarea) {
                  const value = textarea.value;
                  _setImmediateValue(value);
                  editor.setValueForLanguage(language || "none", value);
                  setIsEditing(false);
                }
              }
            }}
          >
            {multiline ? (
              <textarea
                aria-label={placeholder ? `Edit ${placeholder}` : "Edit text"}
                ref={editorRef as any}
                className={twMerge(
                  "inline-block w-full bg-transparent textarea-reset mb-0 field-sizing-content focus:outline-none resize-none",
                  className
                )}
                placeholder={placeholder}
                onBlur={() => setIsEditing(false)}
                onChange={(e) => setImmediateValue(e.target.value)}
                value={immediateValue}
              />
            ) : (
              <input
                aria-label={placeholder ? `Edit ${placeholder}` : "Edit text"}
                ref={editorRef as any}
                className={twMerge(
                  "inline-block w-full bg-transparent textarea-reset mb-0 field-sizing-content focus:outline-none resize-none",
                  className
                )}
                placeholder={placeholder}
                onBlur={() => setIsEditing(false)}
                onChange={(e) => setImmediateValue(e.target.value)}
                value={immediateValue}
              />
            )}
          </form>
        )
      ) : (
        <LocaleString
          defaultText={(<span className="text-gray-500">{placeholder}</span>) as any}
          className={className}
          onClick={beginEditing}
          {...props}
        >
          {value ? children : undefined}
        </LocaleString>
      )}
      {!isEditing ? (
        <Button
          onPress={beginEditing}
          className={twMerge(
            "absolute shadow-md flex items-center z-20 text-xs gap-2 -bottom-8 right-0 p-1.5 bg-gray-200 rounded opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
            editButtonClassName
          )}
        >
          <EditTextIcon className="text-xl" /> Edit
        </Button>
      ) : null}
    </div>
  );
}

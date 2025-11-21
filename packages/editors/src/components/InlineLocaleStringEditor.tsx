import type { InternationalString } from "@iiif/presentation-3";
import { EditTextIcon } from "@manifest-editor/components";
import type { InternationalStringEditor } from "@manifest-editor/editor-api";
import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "react-aria-components";
import { LocaleString, useIIIFLanguage, useLocaleString } from "react-iiif-vault";
import { twMerge } from "tailwind-merge";
import { CheckIcon } from "./CanvasPanelViewer/components/SVGIcons";

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
  ...props
}: InlineLocaleStringEditorProps) {
  const [value, language] = useLocaleString(children);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  const [immediateValue, _setImmediateValue] = useState(value);

  const setImmediateValue = (value: string) => {
    _setImmediateValue(value);
    editor.setValueForLanguage(language || "none", value);
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
      role="button"
      tabIndex={0}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        // escape key
        if (e.key === "Escape") {
          _setImmediateValue(value);
          editor.setValueForLanguage(language || "none", value);
          setIsEditing(false);
        }
      }}
      onKeyDownCapture={(e) => e.stopPropagation()}
      className={twMerge(
        "relative group hover:ring-2 ring-me-400 focus-within:ring-2 ring-offset-2 rounded",
        buttonClassName,
      )}
    >
      {isEditing ? (
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
              ref={editorRef as any}
              className={twMerge(
                "inline-block w-full bg-transparent textarea-reset mb-0 field-sizing-content focus:outline-none resize-none",
                className,
              )}
              placeholder={placeholder}
              onBlur={() => setIsEditing(false)}
              onChange={(e) => setImmediateValue(e.target.value)}
              value={immediateValue}
            />
          ) : (
            <input
              ref={editorRef as any}
              className={twMerge(
                "inline-block w-full bg-transparent textarea-reset mb-0 field-sizing-content focus:outline-none resize-none",
                className,
              )}
              placeholder={placeholder}
              onBlur={() => setIsEditing(false)}
              onChange={(e) => setImmediateValue(e.target.value)}
              value={immediateValue}
            />
          )}
        </form>
      ) : (
        <LocaleString
          defaultText={(<span className="text-gray-500">{placeholder}</span>) as any}
          className={className}
          onClick={() => setIsEditing(true)}
          {...props}
        >
          {children}
        </LocaleString>
      )}
      {!isEditing ? (
        <Button
          onClick={() => {
            setIsEditing(true);
          }}
          className="absolute shadow-md flex items-center z-20 text-xs gap-2 -bottom-8 right-0 p-1.5 bg-gray-200 rounded opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        >
          <EditTextIcon className="text-xl" /> Edit
        </Button>
      ) : null}
    </div>
  );
}

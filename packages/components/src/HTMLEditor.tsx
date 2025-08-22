import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Converter } from "showdown";
import { useDebounce } from "tiny-use-debounce";
import TurndownService from "turndown";
import { MDXEditor } from "./MDXEditor";
import { twMerge } from "tailwind-merge";

const converter = new Converter();
converter.setFlavor("github");

const turndownService = new TurndownService();

export function HTMLEditor({
  className,
  value,
  onChange,
  disabled,
}: {
  className?: string;
  value: string;
  disabled?: boolean;
  onChange: (text: string) => void;
}) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [_value, _setValue] = useState<any>(undefined);
  const internalOnChange = useCallback(() => {
    if (editorRef.current) {
      onChange(converter.makeHtml(editorRef.current.getMarkdown()));
    }
  }, []);
  const debounceSave = useDebounce(internalOnChange, 400);
  const memoState = useMemo(() => {
    return turndownService.turndown(value);
  }, []);

  useEffect(() => {
    const ref = editorRef.current;
    return () => {
      if (ref) {
        onChange(converter.makeHtml(ref.getMarkdown()));
      }
    };
  }, []);

  return (
    <MDXEditor
      editorRef={editorRef}
      onBlur={internalOnChange}
      readOnly={disabled}
      className={twMerge(
        [
          "bg-white prose-sm text-sm border rounded prose-a:text-me-primary-500 prose-a:underline prose-ul:list-disc p-0.5",
          "prose-ol:list-decimal",
          "focus-within:outline-none focus-within:border-me-primary-500 z-50 relative",
        ].join(" "),
        className
      )}
      markdown={memoState}
      suppressHtmlProcessing
      onError={(err) => {
        console.log("err", err);
      }}
      onChange={(value) => {
        _setValue(value);
        debounceSave();
      }}
    />
  );
}

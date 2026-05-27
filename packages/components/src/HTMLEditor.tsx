import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Converter } from "showdown";
import { twMerge } from "tailwind-merge";
import { useDebounce } from "tiny-use-debounce";
import TurndownService from "turndown";
import { MDXEditor } from "./MDXEditor";

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
  const lastEmittedHtml = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const internalOnChange = useCallback(() => {
    if (editorRef.current) {
      const nextHtml = converter.makeHtml(editorRef.current.getMarkdown());
      if (nextHtml !== lastEmittedHtml.current) {
        lastEmittedHtml.current = nextHtml;
        onChangeRef.current(nextHtml);
      }
    }
  }, []);
  const debounceSave = useDebounce(internalOnChange, 400);
  const memoState = useMemo(() => {
    return turndownService.turndown(value);
  }, []);

  useEffect(() => {
    const ref = editorRef.current;
    const saveCurrentValue = () => {
      if (!ref) {
        return;
      }

      const nextHtml = converter.makeHtml(ref.getMarkdown());
      if (nextHtml !== lastEmittedHtml.current) {
        lastEmittedHtml.current = nextHtml;
        onChangeRef.current(nextHtml);
      }
    };

    return () => {
      debounceSave.cancel();
      saveCurrentValue();
    };
  }, [debounceSave]);

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
      onChange={() => {
        debounceSave();
      }}
    />
  );
}

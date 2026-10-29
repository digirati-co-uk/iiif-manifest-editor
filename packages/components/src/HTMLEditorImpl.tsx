import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useDebounce } from "tiny-use-debounce";
import { htmlToMarkdown, markdownToHtml } from "./html-editor-conversion";
import { MDXEditor } from "./MDXEditorImpl";
import "./HTMLEditor.css";

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
      const nextHtml = markdownToHtml(editorRef.current.getMarkdown());
      if (nextHtml !== lastEmittedHtml.current) {
        lastEmittedHtml.current = nextHtml;
        onChangeRef.current(nextHtml);
      }
    }
  }, []);
  const debounceSave = useDebounce(internalOnChange, 400);
  const markdown = useMemo(() => {
    return htmlToMarkdown(value);
  }, [value]);

  useEffect(() => {
    if (value === lastEmittedHtml.current) return;
    lastEmittedHtml.current = value;
    editorRef.current?.setMarkdown(markdown);
  }, [markdown, value]);

  useEffect(() => {
    const ref = editorRef.current;
    const saveCurrentValue = () => {
      if (!ref) {
        return;
      }

      const nextHtml = markdownToHtml(ref.getMarkdown());
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
          "me-html-editor prose prose-sm max-w-none text-sm prose-a:text-me-primary-500 prose-a:underline prose-ul:list-disc",
          "prose-ol:list-decimal relative",
        ].join(" "),
        className
      )}
      markdown={markdown}
      onError={(err) => {
        console.log("err", err);
      }}
      onChange={() => {
        debounceSave();
      }}
    />
  );
}

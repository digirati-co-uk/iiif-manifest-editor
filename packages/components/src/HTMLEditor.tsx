import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Converter } from "showdown";
import { useDebounce } from "tiny-use-debounce";
import { MDXEditor } from "./MDXEditor";
import TurndownService from "turndown";
import { MDXEditorMethods } from "@mdxeditor/editor";

const converter = new Converter();
converter.setFlavor("github");

const turndownService = new TurndownService();

export function HTMLEditor({
  value,
  onChange,
  disabled,
}: {
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
    let ref = editorRef.current;
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
      className="bg-white prose-sm text-sm border rounded-lg p-0.5 focus-within:outline-none focus-within:border-me-primary-500"
      markdown={memoState}
      suppressHtmlProcessing
      onError={(err) => {
        console.log("err", err);
      }}
      onChange={(value) => {
        console.log("CHANGE");
        _setValue(value);
        debounceSave();
      }}
    />
  );
}

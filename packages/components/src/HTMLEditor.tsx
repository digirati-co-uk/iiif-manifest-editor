import { useMemo, useState } from "react";
import { Converter } from "showdown";
import { useDebounce } from "tiny-use-debounce";
import { MDXEditor } from "./MDXEditor";

const converter = new Converter();
converter.setFlavor("github");

export function HTMLEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  disabled?: boolean;
  onChange: (text: string) => void;
}) {
  const [_value, _setValue] = useState(value);
  const debounceSave = useDebounce(onChange, 400);
  const memoState = useMemo(() => {
    return converter.makeMarkdown(value);
  }, []);

  return (
    <MDXEditor
      readOnly={disabled}
      className="bg-white prose-sm text-sm border rounded-lg p-0.5 focus-within:outline-none focus-within:border-me-primary-500"
      markdown={memoState}
      onChange={(value) => {
        debounceSave(converter.makeHtml(value));
      }}
    />
  );
}

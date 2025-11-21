import { useGenericEditor } from "@manifest-editor/shell";
import { useCanvas } from "react-iiif-vault";
import { InlineLocaleStringEditor, type LocaleStringProps } from "./InlineLocaleStringEditor";

export function EditableCanvasLabel(props: Omit<LocaleStringProps, "children">) {
  const canvas = useCanvas();
  const editor = useGenericEditor(canvas);

  return (
    <InlineLocaleStringEditor editor={editor.descriptive.label} {...props}>
      {canvas!.label}
    </InlineLocaleStringEditor>
  );
}

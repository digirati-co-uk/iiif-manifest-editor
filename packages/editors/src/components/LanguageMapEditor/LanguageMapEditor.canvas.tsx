import { useCanvas } from "react-iiif-vault/presentation-4";
import { LanguageMapEditor } from "./LanguageMapEditor";
import { LanguageMapEditorProps } from "./LanguageMapEditor.types";
import { ResourceEditingProvider } from "@manifest-editor/shell";

export function LanguageMapEditorCanvas(props: LanguageMapEditorProps) {
  const canvas = useCanvas();

  return (
    <ResourceEditingProvider resource={canvas}>
      <LanguageMapEditor {...props} />
    </ResourceEditingProvider>
  );
}

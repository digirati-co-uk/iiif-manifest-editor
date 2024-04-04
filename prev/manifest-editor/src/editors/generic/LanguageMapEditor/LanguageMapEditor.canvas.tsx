import { useCanvas } from "react-iiif-vault";
import { LanguageMapEditor } from "./LanguageMapEditor";
import { LanguageMapEditorProps } from "./LanguageMapEditor.types";
import { ResourceEditingProvider } from "@/shell";

export function LanguageMapEditorCanvas(props: LanguageMapEditorProps) {
  const canvas = useCanvas();

  return (
    <ResourceEditingProvider resource={canvas}>
      <LanguageMapEditor {...props} />
    </ResourceEditingProvider>
  );
}

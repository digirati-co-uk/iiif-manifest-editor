import { useManifest } from "react-iiif-vault/presentation-4";
import { LanguageMapEditor } from "./LanguageMapEditor";
import { LanguageMapEditorProps } from "./LanguageMapEditor.types";
import { ResourceEditingProvider } from "@manifest-editor/shell";

export function LanguageMapEditorManifest(props: LanguageMapEditorProps) {
  const manifest = useManifest();

  return (
    <ResourceEditingProvider resource={manifest}>
      <LanguageMapEditor {...props} />
    </ResourceEditingProvider>
  );
}

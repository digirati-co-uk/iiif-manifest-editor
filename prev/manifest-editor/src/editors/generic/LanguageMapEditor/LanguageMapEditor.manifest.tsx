import { useManifest } from "react-iiif-vault";
import { LanguageMapEditor } from "./LanguageMapEditor";
import { LanguageMapEditorProps } from "./LanguageMapEditor.types";
import { ResourceEditingProvider } from "@/shell";

export function LanguageMapEditorManifest(props: LanguageMapEditorProps) {
  const manifest = useManifest();

  return (
    <ResourceEditingProvider resource={manifest}>
      <LanguageMapEditor {...props} />
    </ResourceEditingProvider>
  );
}

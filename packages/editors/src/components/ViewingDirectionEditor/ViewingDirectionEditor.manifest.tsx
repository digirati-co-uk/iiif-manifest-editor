import { ResourceEditingProvider } from "@manifest-editor/shell";
import { useManifest } from "react-iiif-vault/presentation-4";
import { ViewingDirectionEditor } from "./ViewingDirectionEditor";

export function ViewingDirectionEditorManifest(props: { id?: string; name?: string }) {
  const manifest = useManifest();

  return (
    <ResourceEditingProvider resource={manifest}>
      <ViewingDirectionEditor {...props} />
    </ResourceEditingProvider>
  );
}

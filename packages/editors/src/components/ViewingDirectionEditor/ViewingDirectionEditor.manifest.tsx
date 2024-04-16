import { ResourceEditingProvider } from "@manifest-editor/shell";
import { useManifest } from "react-iiif-vault";
import { ViewingDirectionEditor } from "./ViewingDirectionEditor";

export function ViewingDirectionEditorManifest(props: { id?: string; name?: string }) {
  const manifest = useManifest();

  return (
    <ResourceEditingProvider resource={manifest}>
      <ViewingDirectionEditor {...props} />
    </ResourceEditingProvider>
  );
}

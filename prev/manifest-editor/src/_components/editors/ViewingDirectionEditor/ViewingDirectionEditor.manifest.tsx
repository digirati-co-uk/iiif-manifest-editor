import { useManifest } from "react-iiif-vault";
import { ResourceEditingProvider } from "@/shell/ResourceEditingContext/ResourceEditingContext";
import { ViewingDirectionEditor } from "@/_components/editors/ViewingDirectionEditor/ViewingDirectionEditor";

export function ViewingDirectionEditorManifest(props: { id?: string; name?: string }) {
  const manifest = useManifest();

  return (
    <ResourceEditingProvider resource={manifest}>
      <ViewingDirectionEditor {...props} />
    </ResourceEditingProvider>
  );
}

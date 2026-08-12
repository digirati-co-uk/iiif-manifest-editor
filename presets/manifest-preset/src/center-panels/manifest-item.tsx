import { CanvasPanelEditor, SceneEditor, TimelineEditor } from "@manifest-editor/editors";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useManifestItemInStack } from "../manifest-items";

export function ManifestItemCenterPanel() {
  const selected = useManifestItemInStack();
  const item = selected?.resource?.source;

  if (item?.type === "Scene") {
    return <SceneEditor />;
  }

  if (item?.type === "Timeline") {
    return <TimelineEditor />;
  }

  return item?.type === "Canvas" ? <CanvasPanelEditor /> : <EmptyState>No manifest item selected</EmptyState>;
}

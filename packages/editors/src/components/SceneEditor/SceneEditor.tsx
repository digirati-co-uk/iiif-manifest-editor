import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { useVault } from "react-iiif-vault";
import { ScenePanel } from "react-iiif-vault/scene-panel";
import "react-iiif-vault/scene-panel.css";
import { useInStack } from "../../helpers";

export function SceneEditor() {
  const scene = useInStack("Scene");
  const vault = useVault();
  const sceneRef = scene?.resource.source;

  if (!sceneRef) return <EmptyState>No scene selected</EmptyState>;

  return (
    <ScenePanel
      key={sceneRef.id}
      scene={{ id: sceneRef.id, type: "Scene" }}
      vault={vault as any}
      controls
      className="h-full min-h-0 bg-me-gray-900"
      style={{ height: "100%" }}
      loadingFallback="Loading scene…"
      errorFallback="The scene could not be rendered."
    />
  );
}

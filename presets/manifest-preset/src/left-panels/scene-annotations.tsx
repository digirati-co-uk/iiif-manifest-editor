import { SceneAnnotations } from "@manifest-editor/editors";
import { SceneIcon } from "@manifest-editor/components";
import type { LayoutPanel } from "@manifest-editor/shell";

export const sceneAnnotationsPanel: LayoutPanel = {
  id: "scene-annotations",
  label: "3D annotations",
  icon: <SceneIcon name="annotations" />,
  supports: ({ rootResource, vault }) => {
    if (!rootResource || !vault) return false;
    const manifest = vault.get<any>(rootResource, { skipSelfReturn: false });
    return manifest?.type === "Manifest" && (manifest.items || []).some((item: any) => item.type === "Scene");
  },
  focusedMode: { closeOnMainPanelClick: false },
  render: () => <SceneAnnotations />,
};

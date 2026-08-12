import { SceneContents } from "@manifest-editor/editors";
import { SceneIcon } from "@manifest-editor/components";
import type { LayoutPanel } from "@manifest-editor/shell";

export const sceneContentsPanel: LayoutPanel = {
  id: "scene-contents",
  label: "Scene contents",
  icon: <SceneIcon name="contents" />,
  supports: ({ rootResource, vault }) => {
    if (!rootResource || !vault) return false;
    const manifest = vault.get<any>(rootResource, { skipSelfReturn: false });
    return manifest?.type === "Manifest" && (manifest.items || []).some((item: any) => item.type === "Scene");
  },
  render: () => <SceneContents />,
};

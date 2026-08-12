import { SceneActivations } from "@manifest-editor/editors";
import type { LayoutPanel } from "@manifest-editor/shell";
import type { SVGProps } from "react";

export const sceneActivationsPanel: LayoutPanel = {
  id: "scene-activations",
  label: "Activations",
  icon: <ActivationsIcon />,
  supports: ({ rootResource, vault }) => {
    if (!rootResource || !vault) return false;
    const manifest = vault.get<any>(rootResource, { skipSelfReturn: false });
    return manifest?.type === "Manifest" && (manifest.items || []).some((item: any) => item.type === "Scene");
  },
  focusedMode: { closeOnMainPanelClick: false },
  render: () => <SceneActivations />,
};

function ActivationsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <path d="M5 6h9M5 12h14M5 18h9" />
      <circle cx="17" cy="6" r="2" />
      <circle cx="16" cy="18" r="2" />
      <path d="m10 9 2 3-2 3" />
    </svg>
  );
}

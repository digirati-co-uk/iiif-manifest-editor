import { SceneAnnotations } from "@manifest-editor/editors";
import type { LayoutPanel } from "@manifest-editor/shell";
import type { SVGProps } from "react";

export const sceneAnnotationsPanel: LayoutPanel = {
  id: "scene-annotations",
  label: "3D annotations",
  icon: <SceneAnnotationsIcon />,
  supports: ({ rootResource, vault }) => {
    if (!rootResource || !vault) return false;
    const manifest = vault.get<any>(rootResource, { skipSelfReturn: false });
    return (
      manifest?.type === "Manifest" &&
      (manifest.items || []).some((item: any) => item.type === "Scene")
    );
  },
  focusedMode: { closeOnMainPanelClick: false },
  render: () => <SceneAnnotations />,
};

function SceneAnnotationsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      {...props}
    >
      <path d="m4 7 8-4 8 4-8 4-8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="M12 11v10" />
      <circle cx="12" cy="11" r="2" fill="currentColor" />
    </svg>
  );
}

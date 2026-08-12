import type { LayoutPanel } from "@manifest-editor/shell";
import { useManifest } from "react-iiif-vault/presentation-4";
import { PreviewIcon } from "../icons/PreviewIcon";

export const exhibitionOverviewLeftPanel: LayoutPanel = {
  id: "@exhibitions/overview-panel", // We are overriding the default canvas listing panel
  label: "Preview",
  icon: <PreviewIcon />,
  render: () => <ExhibitionOverviewPanel />,
};

export function ExhibitionOverviewPanel() {
  const manifest = useManifest();

  if (!manifest) return null;

  return (
    <div>
      Coming soon.
      {/*<DelftExhibition manifest={manifest.id} language="en" viewObjectLinks={[]} />*/}
    </div>
  );
}

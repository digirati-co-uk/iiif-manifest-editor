import { InfoIcon } from "@manifest-editor/components";
import type { LayoutPanel } from "@manifest-editor/shell";
import { useManifest } from "react-iiif-vault";

export const exhibitionOverviewLeftPanel: LayoutPanel = {
  id: "@exhibitions/overview-panel", // We are overriding the default canvas listing panel
  label: "",
  icon: <div className="hidden hover:block">👀</div>,
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

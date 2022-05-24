import { LayoutPanel } from "../../shell/Layout/Layout.types";
import { ManifestForm } from "../../editors/ManifestProperties/ManifestForm";

export default { title: "Manifest editor (layout)" };

export const leftPanels: LayoutPanel[] = [
  // ThumbnailList
  // OutlineView
];

export const centerPanels: LayoutPanel[] = [
  // CanvasPanel
  // Thumbnails
];

export const rightPanels: LayoutPanel[] = [
  {
    id: "manifest-properties",
    label: "Manifest properties",
    defaultState: { current: 0 },
    render: ({ current }: { current: number }, { change }) => (
      <ManifestForm
        current={current}
        setCurrent={(idx) => change({ id: "manifest-properties", state: { current: idx } })}
      />
    ),
  },
  // <CanvasForm />
  // <MediaForm />
  // <CanvasThumbnailForm />
  // <ManifestThumbnailForm />
];

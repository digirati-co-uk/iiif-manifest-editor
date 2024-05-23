import { CanvasThumbnailGridItem, ThumbnailGridContainer } from "@manifest-editor/components";
import { useToggleList, useInStack } from "@manifest-editor/editors";
import { LayoutPanel, useCreator, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";

export const manifestOverview: LayoutPanel = {
  id: "overview",
  label: "Overview",
  icon: "",
  render: () => <ManifestOverview />,
};

function ManifestOverview() {
  const { edit, open } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const { items } = structural;
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Canvas");
  const canvases = items.get();

  if (!canvases) {
    return null;
  }

  return (
    <ThumbnailGridContainer wide>
      {canvases.map((item) => (
        <CanvasThumbnailGridItem
          id={item.id}
          key={item.id}
          onClick={() => {
            open({ id: "current-canvas" });
            open({ id: "canvas-thumbnails" });
            canvasActions.edit(item);
          }}
        />
      ))}
    </ThumbnailGridContainer>
  );
}

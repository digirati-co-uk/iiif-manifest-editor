import {
  CanvasThumbnailGridItem,
  ManifestOverviewEmptyState,
  ThumbnailGridContainer,
  useFastList,
} from "@manifest-editor/components";
import {
  type LayoutPanel,
  useCreator,
  useLayoutActions,
  useManifestEditor,
} from "@manifest-editor/shell";

export const manifestOverview: LayoutPanel = {
  id: "overview",
  label: "Overview",
  icon: "",
  render: () => <ManifestOverviewCenterPanel />,
};

export function ManifestOverviewCenterPanel() {
  const { edit, open } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const { items } = structural;
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(
    manifest,
    "items",
    "Canvas",
  );
  const canvases = useFastList(items.get(), 24);

  if (!canvases || canvases.length === 0) {
    return (
      <div>
        <ManifestOverviewEmptyState
          onCreate={canvasActions.create}
          canCreate={canCreateCanvas}
        />
      </div>
    );
  }
  return (
    <ThumbnailGridContainer wide>
      {canvases.map((item) => (
        <CanvasThumbnailGridItem
          id={item.id}
          key={item.id}
          onClick={() => {
            open({ id: "current-canvas" });
            open({ id: "canvas-listing", state: { gridView: true } });
            canvasActions.edit(item);
          }}
        />
      ))}
    </ThumbnailGridContainer>
  );
}

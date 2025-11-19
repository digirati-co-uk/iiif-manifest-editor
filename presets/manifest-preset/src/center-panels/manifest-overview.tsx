import {
  ActionButton,
  AddIcon,
  CanvasThumbnailGridItem,
  IIIFBrowserIcon,
  ManifestOverviewEmptyState,
  ThumbnailGridContainer,
  useFastList,
  useGridOptions,
} from "@manifest-editor/components";
import { EditableCanvasLabel } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useConfig,
  useCreator,
  useLayoutActions,
  useLayoutState,
  useManifestEditor,
} from "@manifest-editor/shell";
import { useState } from "react";

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
  const {
    editorFeatureFlags: { manifestGridOptions = false },
  } = useConfig();
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Canvas", undefined, { isPainting: true });
  const canvases = useFastList(items.get(), 24);
  const { leftPanel } = useLayoutState();
  const isEditingManifest = leftPanel.current === "left-panel-manifest";
  const [{ size }, gridOptions] = useGridOptions("manifest-grid-size");

  if (!canvases || canvases.length === 0) {
    return (
      <div>
        <ManifestOverviewEmptyState onCreate={canvasActions.create} canCreate={canCreateCanvas} />
      </div>
    );
  }
  return (
    <>
      {manifestGridOptions ? (
        <div className="p-2 flex gap-2 justify-between items-center">
          {gridOptions}
          <div className="flex gap-2">
            <ActionButton isDisabled={!canCreateCanvas} onPress={() => canvasActions.create()}>
              <AddIcon className="text-xl" /> Add new canvas
            </ActionButton>
            <ActionButton onPress={() => canvasActions.creator("@manifest-editor/iiif-browser-creator")}>
              <IIIFBrowserIcon className="text-xl" />
            </ActionButton>
          </div>
        </div>
      ) : null}
      <ThumbnailGridContainer wide size={size}>
        {canvases.map((item) => (
          <CanvasThumbnailGridItem
            id={item.id}
            key={item.id}
            onClick={() => {
              open({ id: "current-canvas" });
              if (isEditingManifest) {
                open({ id: "canvas-listing", state: { gridView: true } });
              }
              canvasActions.edit(item);
            }}
          />
        ))}
      </ThumbnailGridContainer>
    </>
  );
}

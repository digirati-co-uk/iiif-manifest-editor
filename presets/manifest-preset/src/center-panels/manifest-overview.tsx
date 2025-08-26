import {
  ActionButton,
  AddIcon,
  CanvasThumbnailGridItem,
  IIIFBrowserIcon,
  ManifestOverviewEmptyState,
  ThumbnailGridContainer,
  useFastList,
} from "@manifest-editor/components";
import { useConfig, useLocalStorage } from "@manifest-editor/shell";
import {
  type LayoutPanel,
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
  const [canCreateCanvas, canvasActions] = useCreator(
    manifest,
    "items",
    "Canvas",
    undefined,
    { isPainting: true },
  );
  const canvases = useFastList(items.get(), 24);
  const { leftPanel } = useLayoutState();
  const isEditingManifest = leftPanel.current === "left-panel-manifest";
  const [size, setSize] = useLocalStorage<"grid-sm" | "grid-md" | "grid-lg">(
    "manifest-grid-size",
    "grid-md",
  );

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
    <>
      {manifestGridOptions ? (
        <div className="p-2 flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="opacity-50 text-sm">Grid size</div>
            <ActionButton
              primary={size === "grid-sm"}
              onPress={() => setSize("grid-sm")}
            >
              Small
            </ActionButton>
            <ActionButton
              primary={size === "grid-md"}
              onPress={() => setSize("grid-md")}
            >
              Medium
            </ActionButton>
            <ActionButton
              primary={size === "grid-lg"}
              onPress={() => setSize("grid-lg")}
            >
              Large
            </ActionButton>
          </div>
          <div className="flex gap-2">
            <ActionButton
              isDisabled={!canCreateCanvas}
              onPress={() => canvasActions.create()}
            >
              <AddIcon className="text-xl" /> Add new canvas
            </ActionButton>
            <ActionButton
              onPress={() =>
                canvasActions.creator("@manifest-editor/iiif-browser-creator")
              }
            >
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

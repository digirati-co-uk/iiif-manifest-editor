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
  FLAG_TAG,
  getResourceTags,
  type LayoutPanel,
  ManifestEditorTagIcon,
  ManifestEditorTagOverlay,
  useApp,
  useConfig,
  useCreator,
  useLayoutActions,
  useLayoutState,
  useManifestEditor,
} from "@manifest-editor/shell";
import { useMemo, useState } from "react";
import { useVaultSelector } from "react-iiif-vault";

export const manifestOverview: LayoutPanel = {
  id: "overview",
  label: "Overview",
  icon: "",
  render: () => <ManifestOverviewCenterPanel />,
};

export function ManifestOverviewCenterPanel() {
  const { metadata } = useApp();
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
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const canvasIds = useMemo(() => (canvases || []).map((item) => item.id).join("|"), [canvases]);
  const canvasTags = useVaultSelector(
    (_, vault) => {
      const tags: Record<string, ReturnType<typeof getResourceTags>> = {};
      for (const item of canvases || []) {
        tags[item.id] = getResourceTags(vault, { id: item.id, type: "Canvas" });
      }
      return tags;
    },
    [canvasIds],
  );
  const [visibleCanvases, numberOfFlaggedCanvases] = useMemo(() => {
    const flaggedCanvases = (canvases || []).filter((item) =>
      canvasTags[item.id]?.some((tag) => tag.type === FLAG_TAG.type && tag.id === FLAG_TAG.id),
    );

    if (!showOnlyFlagged) {
      return [canvases || [], flaggedCanvases.length] as const;
    }
    return [flaggedCanvases, flaggedCanvases.length] as const;
  }, [canvases, canvasTags, showOnlyFlagged]);

  const createCanvas =
    metadata.id === "exhibition-editor"
      ? (index: any, data: any) => {
          return canvasActions.createFiltered("exhibition-slide", index, data);
        }
      : canvasActions.create;

  if (!canvases || canvases.length === 0) {
    return (
      <div>
        <ManifestOverviewEmptyState onCreate={createCanvas} canCreate={canCreateCanvas} />
      </div>
    );
  }
  return (
    <>
      {manifestGridOptions ? (
        <div className="p-2 flex gap-2 justify-between items-center">
          {gridOptions}
          <div className="flex gap-2">
            {numberOfFlaggedCanvases > 0 && (
              <ActionButton
                primary={showOnlyFlagged}
                aria-pressed={showOnlyFlagged}
                onPress={() => setShowOnlyFlagged((showing) => !showing)}
              >
                <ManifestEditorTagIcon icon={FLAG_TAG.icon} className="text-xl" /> Show only flagged
              </ActionButton>
            )}
            <ActionButton isDisabled={!canCreateCanvas} onPress={() => createCanvas()}>
              <AddIcon className="text-xl" /> Add new canvas
            </ActionButton>
            <ActionButton onPress={() => canvasActions.creator("@manifest-editor/iiif-browser-creator")}>
              <IIIFBrowserIcon className="text-xl" />
            </ActionButton>
          </div>
        </div>
      ) : null}
      {showOnlyFlagged && visibleCanvases.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No flagged canvases</div>
      ) : (
        <ThumbnailGridContainer wide size={size}>
          {visibleCanvases.map((item) => (
            <CanvasThumbnailGridItem
              id={item.id}
              key={item.id}
              icon={<ManifestEditorTagOverlay tags={canvasTags[item.id] || []} />}
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
      )}
    </>
  );
}

import {
  ActionButton,
  AddIcon,
  CanvasThumbnailGridItem,
  IIIFBrowserIcon,
  ManifestIcon,
  ManifestOverviewEmptyState,
  ThumbnailGridContainer,
  useFastList,
  useGridOptions,
} from "@manifest-editor/components";
import { EditableCanvasLabel } from "@manifest-editor/editors";
import {
  getCanvasProgressStatusFromState,
  FLAG_TAG,
  getResourceTagsFromState,
  ManifestEditorCanvasProgressOverlay,
  type LayoutPanel,
  ManifestEditorTagIcon,
  ManifestEditorTagOverlay,
  useApp,
  useConfig,
  useCreator,
  useLayoutActions,
  useLayoutMode,
  useLayoutState,
  useManifestEditor,
} from "@manifest-editor/shell";
import { useMemo, useState } from "react";
import { useVaultSelector } from "react-iiif-vault";
import styled from "styled-components";

const CanvasGridLayoutOffset = styled.div`
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding-inline-start: var(--manifest-editor-layout-left-sidebar-small, 0px);
  padding-inline-end: var(--manifest-editor-layout-right-sidebar-small, 0px);

  > .grid {
    overflow-y: visible;
  }
`;

const CanvasGridControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-block: 0.5rem;
  padding-inline-start: calc(
    0.5rem + var(--manifest-editor-layout-left-sidebar-small, 0px)
  );
  padding-inline-end: calc(
    0.5rem + var(--manifest-editor-layout-right-sidebar-large, 0px)
  );
`;

export const manifestOverview: LayoutPanel = {
  id: "overview",
  label: "Overview",
  icon: <ManifestIcon />,
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
  const [canCreateCanvas, canvasActions] = useCreator(
    manifest,
    "items",
    "Canvas",
    undefined,
    { isPainting: true },
  );
  const canvases = useFastList(items.get(), 24);
  const layoutMode = useLayoutMode();
  const { leftPanel } = useLayoutState();
  const isEditingManifest = leftPanel.current === "left-panel-manifest";
  const [{ size }, gridOptions] = useGridOptions("manifest-grid-size");
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const canvasIds = useMemo(
    () => (canvases || []).map((item) => item.id).join("|"),
    [canvases],
  );
  const canvasTags = useVaultSelector(
    (state) => {
      const tags: Record<
        string,
        ReturnType<typeof getResourceTagsFromState>
      > = {};
      for (const item of canvases || []) {
        tags[item.id] = getResourceTagsFromState(state, {
          id: item.id,
          type: "Canvas",
        });
      }
      return tags;
    },
    [canvasIds],
  );
  const canvasProgressStatuses = useVaultSelector(
    (state) => {
      const statuses: Record<
        string,
        ReturnType<typeof getCanvasProgressStatusFromState>
      > = {};
      for (const item of canvases || []) {
        statuses[item.id] = getCanvasProgressStatusFromState(state, {
          id: item.id,
          type: "Canvas",
        });
      }
      return statuses;
    },
    [canvasIds],
  );
  const [visibleCanvases, numberOfFlaggedCanvases] = useMemo(() => {
    const flaggedCanvases = (canvases || []).filter((item) =>
      canvasTags[item.id]?.some(
        (tag) => tag.type === FLAG_TAG.type && tag.id === FLAG_TAG.id,
      ),
    );

    if (!showOnlyFlagged) {
      return [canvases || [], flaggedCanvases.length] as const;
    }
    return [flaggedCanvases, flaggedCanvases.length] as const;
  }, [canvases, canvasTags, showOnlyFlagged]);

  const exhibitionCreatorFilter =
    metadata.id === "exhibition-slideshow-editor"
      ? "exhibition-slideshow-slide"
      : metadata.id === "exhibition-editor"
        ? "exhibition-slide"
        : null;
  const createCanvas = exhibitionCreatorFilter
    ? (index: any, data: any) => {
        return canvasActions.createFiltered(
          exhibitionCreatorFilter,
          index,
          data,
        );
      }
    : canvasActions.create;

  if (!canvases || canvases.length === 0) {
    return (
      <div>
        <ManifestOverviewEmptyState
          onCreate={createCanvas}
          canCreate={canCreateCanvas}
        />
      </div>
    );
  }
  return (
    <>
      {manifestGridOptions ? (
        <CanvasGridControls>
          {gridOptions}
          <div className="flex gap-2">
            {numberOfFlaggedCanvases > 0 && (
              <ActionButton
                primary={showOnlyFlagged}
                aria-pressed={showOnlyFlagged}
                onPress={() => setShowOnlyFlagged((showing) => !showing)}
              >
                <ManifestEditorTagIcon
                  icon={FLAG_TAG.icon}
                  className="text-xl"
                />{" "}
                Show only flagged
              </ActionButton>
            )}
            <ActionButton
              isDisabled={!canCreateCanvas}
              onPress={() => createCanvas()}
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
        </CanvasGridControls>
      ) : null}
      {showOnlyFlagged && visibleCanvases.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No flagged canvases</div>
      ) : (
        <CanvasGridLayoutOffset>
          <ThumbnailGridContainer wide size={size}>
            {visibleCanvases.map((item) => (
              <CanvasThumbnailGridItem
                id={item.id}
                key={item.id}
                icon={
                  <CanvasThumbnailFeedback
                    tags={canvasTags[item.id] || []}
                    status={canvasProgressStatuses[item.id] || "none"}
                  />
                }
                onClick={() => {
                  open({ id: "current-canvas" });
                  if (layoutMode === "default" && isEditingManifest) {
                    open({ id: "canvas-listing", state: { gridView: true } });
                  }
                  canvasActions.edit(item);
                }}
              />
            ))}
          </ThumbnailGridContainer>
        </CanvasGridLayoutOffset>
      )}
    </>
  );
}

function CanvasThumbnailFeedback({
  tags,
  status,
}: {
  tags: ReturnType<typeof getResourceTagsFromState>;
  status: ReturnType<typeof getCanvasProgressStatusFromState>;
}) {
  return (
    <>
      <ManifestEditorCanvasProgressOverlay status={status} />
      <ManifestEditorTagOverlay tags={tags} />
    </>
  );
}

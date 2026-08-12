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
import {
  FLAG_TAG,
  getCanvasProgressStatusFromState,
  getResourceTagsFromState,
  type LayoutPanel,
  ManifestEditorCanvasProgressOverlay,
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
import { getValue } from "@iiif/helpers";
import { useMemo, useState } from "react";
import { useVaultSelector } from "react-iiif-vault/presentation-4";
import styled from "styled-components";
import { useManifestItemInStack } from "../manifest-items";

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
  padding-inline-start: calc(0.5rem + var(--manifest-editor-layout-left-sidebar-small, 0px));
  padding-inline-end: calc(0.5rem + var(--manifest-editor-layout-right-sidebar-large, 0px));
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
  const currentItem = useManifestItemInStack();
  const currentItemId = currentItem?.resource.source.id;
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Canvas", undefined, { isPainting: true });
  const [canCreateTimeline, timelineActions] = useCreator(manifest, "items", "Timeline");
  const manifestItems = useFastList(items.get(), 24);
  const layoutMode = useLayoutMode();
  const { leftPanel } = useLayoutState();
  const isEditingManifest = leftPanel.current === "left-panel-manifest";
  const [{ size }, gridOptions] = useGridOptions("manifest-grid-size");
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const canvasIds = useMemo(
    () =>
      (manifestItems || [])
        .filter((item) => item.type === "Canvas")
        .map((item) => item.id)
        .join("|"),
    [manifestItems]
  );
  const canvasTags = useVaultSelector(
    (state) => {
      const tags: Record<string, ReturnType<typeof getResourceTagsFromState>> = {};
      for (const item of manifestItems || []) {
        if (item.type !== "Canvas") continue;
        tags[item.id] = getResourceTagsFromState(state, {
          id: item.id,
          type: "Canvas",
        });
      }
      return tags;
    },
    [canvasIds]
  );
  const canvasProgressStatuses = useVaultSelector(
    (state) => {
      const statuses: Record<string, ReturnType<typeof getCanvasProgressStatusFromState>> = {};
      for (const item of manifestItems || []) {
        if (item.type !== "Canvas") continue;
        statuses[item.id] = getCanvasProgressStatusFromState(state, {
          id: item.id,
          type: "Canvas",
        });
      }
      return statuses;
    },
    [canvasIds]
  );
  const [visibleItems, numberOfFlaggedCanvases] = useMemo(() => {
    const flaggedCanvases = (manifestItems || []).filter((item) =>
      canvasTags[item.id]?.some((tag) => tag.type === FLAG_TAG.type && tag.id === FLAG_TAG.id)
    );

    if (!showOnlyFlagged) {
      return [manifestItems || [], flaggedCanvases.length] as const;
    }
    return [flaggedCanvases, flaggedCanvases.length] as const;
  }, [manifestItems, canvasTags, showOnlyFlagged]);

  const exhibitionCreatorFilter =
    metadata.id === "exhibition-slideshow-editor"
      ? "exhibition-slideshow-slide"
      : metadata.id === "exhibition-editor"
        ? "exhibition-slide"
        : null;
  const createCanvas = exhibitionCreatorFilter
    ? (index: any, data: any) => {
        return canvasActions.createFiltered(exhibitionCreatorFilter, index, data);
      }
    : canvasActions.create;

  if (!manifestItems || manifestItems.length === 0) {
    return (
      <div>
        <ManifestOverviewEmptyState onCreate={createCanvas} canCreate={canCreateCanvas} />
        {canCreateTimeline ? (
          <div className="flex justify-center gap-2 pb-8">
            <ActionButton onPress={() => timelineActions.create()}>Add a timeline</ActionButton>
          </div>
        ) : null}
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
                <ManifestEditorTagIcon icon={FLAG_TAG.icon} className="text-xl" /> Show only flagged
              </ActionButton>
            )}
            <ActionButton isDisabled={!canCreateCanvas} onPress={() => createCanvas()}>
              <AddIcon className="text-xl" /> Add new canvas
            </ActionButton>

            <ActionButton
              aria-label="Browse IIIF resources"
              onPress={() => canvasActions.creator("@manifest-editor/iiif-browser-creator")}
            >
              <IIIFBrowserIcon aria-hidden="true" className="text-xl" />
            </ActionButton>
            {canCreateTimeline ? (
              <ActionButton onPress={() => timelineActions.create()}>
                <AddIcon className="text-xl" /> Add new timeline
              </ActionButton>
            ) : null}
            <ActionButton onPress={() => canvasActions.creator("@manifest-editor/iiif-browser-creator")}>
              <IIIFBrowserIcon className="text-xl" />
            </ActionButton>
          </div>
        </CanvasGridControls>
      ) : null}
      {showOnlyFlagged && visibleItems.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No flagged canvases</div>
      ) : (
        <CanvasGridLayoutOffset>
          <ThumbnailGridContainer wide size={size}>
            {visibleItems.map((item, index) => {
              const select = () => {
                open({ id: "current-canvas" });
                if (layoutMode === "default" && isEditingManifest) {
                  open({ id: "canvas-listing", state: { gridView: true } });
                }
                canvasActions.edit(item, index);
              };

              return item.type === "Canvas" ? (
                <CanvasThumbnailGridItem
                  id={item.id}
                  key={item.id}
                  selected={item.id === currentItemId}
                  active={item.id === currentItemId}
                  icon={
                    <CanvasThumbnailFeedback
                      tags={canvasTags[item.id] || []}
                      status={canvasProgressStatuses[item.id] || "none"}
                    />
                  }
                  onClick={select}
                />
              ) : (
                <ManifestItemGridItem item={item} key={item.id} selected={item.id === currentItemId} onClick={select} />
              );
            })}
          </ThumbnailGridContainer>
        </CanvasGridLayoutOffset>
      )}
    </>
  );
}

function ManifestItemGridItem({ item, selected, onClick }: { item: any; selected: boolean; onClick: () => void }) {
  const resource = useVaultSelector(
    (_state, vault) => vault.get(item, { skipSelfReturn: false }),
    [item.id, item.type]
  ) as any | undefined;
  const label = getValue(resource?.label) || `Untitled ${item.type.toLowerCase()}`;

  return (
    <button type="button" className="flex min-w-0 flex-col text-left" data-canvas-selected={selected} onClick={onClick}>
      <span
        className={[
          "flex aspect-square w-full items-center justify-center rounded border-2 bg-me-gray-100 p-4 text-center text-me-gray-600",
          selected ? "border-me-primary-500" : "border-transparent",
        ].join(" ")}
      >
        <span>
          <span className="block text-4xl" aria-hidden>
            {item.type === "Scene" ? "◫" : "↔"}
          </span>
          <span className="mt-2 block text-sm font-semibold">{item.type}</span>
        </span>
      </span>
      <span className="mt-1 w-full truncate text-center text-sm">{label}</span>
    </button>
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

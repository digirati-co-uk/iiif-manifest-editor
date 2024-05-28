import { CanvasThumbnailGridItem, ThumbnailGridContainer, useFastList } from "@manifest-editor/components";
import { useToggleList, useInStack } from "@manifest-editor/editors";
import { LayoutPanel, useCreator, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { useEffect, useLayoutEffect, useState } from "react";

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
  const canvases = useFastList(items.get(), 24);

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
            open({ id: "canvas-listing", state: { gridView: true } });
            canvasActions.edit(item);
          }}
        />
      ))}
    </ThumbnailGridContainer>
  );
}

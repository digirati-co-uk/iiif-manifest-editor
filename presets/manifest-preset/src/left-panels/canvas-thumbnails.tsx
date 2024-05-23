import {
  SidebarHeader,
  CanvasThumbnailGridItem,
  ThumbnailGridContainer,
  CreateCanvasIcon,
  SidebarContent,
  Sidebar,
  useFastList,
} from "@manifest-editor/components";
import { useInStack } from "@manifest-editor/editors";
import { LayoutPanel, useCreator, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { useEffect, useLayoutEffect } from "react";

export const canvasThumbnails: LayoutPanel = {
  id: "canvas-thumbnails",
  label: "Grid view",
  icon: <CanvasThumbnailsIcon />,
  render: () => {
    return <CanvasThumbnails />;
  },
};

function CanvasThumbnails() {
  const { open } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const canvas = useInStack("Canvas");
  const { items } = structural;
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Canvas");
  const canvases = useFastList(items.get(), 24);

  useEffect(() => {
    if (canvas?.resource.source.id) {
      const key = items.get().findIndex((c) => c.id === canvas.resource.source.id);
      if (key !== -1) {
        open({ id: "current-canvas" });
        canvasActions.edit({ id: canvas.resource.source.id, type: "Canvas" }, key);
        return;
      }
    }

    if (items.get().length) {
      open({ id: "current-canvas" });
      canvasActions.edit(items.get()[0]);
    }
  }, []);

  useLayoutEffect(() => {
    const selected = document.querySelector('[data-canvas-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: "center" });
    }
  }, [canvases]);

  return (
    <Sidebar>
      <SidebarHeader
        title="Grid view"
        actions={[
          {
            icon: <CreateCanvasIcon />,
            onClick: () => canvasActions.create(),
            title: "Add new canvas",
            disabled: !canCreateCanvas,
          },
        ]}
      />
      <SidebarContent>
        <ThumbnailGridContainer>
          {canvases.map((item) => (
            <CanvasThumbnailGridItem
              id={item.id}
              key={item.id}
              selected={canvas?.resource.source.id === item.id}
              onClick={() => {
                open({ id: "current-canvas" });
                canvasActions.edit(item);
              }}
            />
          ))}
        </ThumbnailGridContainer>
      </SidebarContent>
    </Sidebar>
  );
}

function CanvasThumbnailsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path
        d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"
        fill="currentColor"
      />
    </svg>
  );
}

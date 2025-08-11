import {
  CanvasThumbnailGridItem,
  CreateCanvasIcon,
  IIIFBrowserIcon,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  ThumbnailGridContainer,
  useFastList,
} from "@manifest-editor/components";
import { manifestBrowserCreator } from "@manifest-editor/creators";
import {
  CanvasGrid,
  CanvasList,
  createAppActions,
  InputContainer,
  useInStack,
  useToggleList,
} from "@manifest-editor/editors";
import {
  type LayoutPanel,
  useCreator,
  useEditingStack,
  useLayoutActions,
  useManifestEditor,
} from "@manifest-editor/shell";
import { type SVGProps, useEffect, useLayoutEffect } from "react";
import { useCollection, useManifest } from "react-iiif-vault";

export const CanvasListingIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & { title?: string; titleId?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}

    <g fill="none">
      <path d="M0 0h24v24H0V0z" />
      <path d="M0 0h24v24H0V0z" opacity=".87" />
    </g>
    <path
      d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm-4 6h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
      fill="currentColor"
    />
  </svg>
);

export const canvasListing: LayoutPanel = {
  id: "canvas-listing",
  label: "Canvases",
  icon: <CanvasListingIcon />,
  render: (state, ctx, app) => {
    return (
      <CanvasListing
        gridView={state.gridView || false}
        onChangeGridView={(gridView) => ctx.actions.change("canvas-listing", { gridView })}
      />
    );
  },
};

export function CanvasListing({
  gridView,
  onChangeGridView,
}: {
  gridView: boolean;
  onChangeGridView: (gridView: boolean) => void;
}) {
  const { open } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const [toggled, toggle] = useToggleList();
  const canvas = useInStack("Canvas");
  const { items } = structural;
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Canvas");
  const canvases = useFastList(items.get(), 24);

  useEffect(() => {
    if (canvas?.resource.source.id) {
      // @todo check if this is still needed..
      // const key = items.get().findIndex((c) => c.id === canvas.resource.source.id);
      // if (key !== -1) {
      //   open({ id: "current-canvas" });
      //   canvasActions.edit({ id: canvas.resource.source.id, type: "Canvas" }, key);
      //   return;
      // }
      return;
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
  }, [canvases, gridView]);

  return (
    <Sidebar>
      <SidebarHeader
        title="Canvases"
        actions={[
          {
            icon: <>{gridView ? <CanvasListingIcon width={24} height={24} /> : <CanvasThumbnailsIcon />}</>,
            title: gridView ? "List view" : "Grid view",
            onClick: () => {
              onChangeGridView(!gridView);
            },
          },
          {
            icon: <ListEditIcon />,
            title: "Edit canvases",
            toggled: toggled.items,
            onClick: () => toggle("items"),
          },
          {
            icon: <IIIFBrowserIcon className="text-2xl" />,
            title: "IIIF Browser",
            onClick: () => canvasActions.creator("@manifest-editor/iiif-browser-creator"),
            disabled: !canCreateCanvas,
          },
          {
            icon: <CreateCanvasIcon />,
            title: "Add new canvas",
            onClick: () => canvasActions.create(),
            disabled: !canCreateCanvas,
          },
        ]}
      />
      {gridView ? <CanvasGridView isEditing={toggled.items} /> : <CanvasListView isEditing={toggled.items} />}
    </Sidebar>
  );
}

export function useEditCanvasItems() {
  const { edit, open } = useLayoutActions();
  const canvas = useInStack("Canvas");
  const { technical, structural } = useManifestEditor();
  const { items } = structural;
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const canvases = useFastList(items.get(), 24);
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Canvas");

  return {
    canvas,
    canvases,
    items,
    canvasActions,
    open,
    edit,
    canCreateCanvas,
  };
}

export function CanvasGridView({ isEditing }: { isEditing: boolean }) {
  const { canvas, items, canvasActions, open } = useEditCanvasItems();
  const manifest = useManifest();
  const editingStack = useEditingStack();
  const canvases = items.get();
  const canvasId = canvas?.resource.source.id;

  // Find current canvas to get its index before deleting it
  const canvasIndex = canvases.findIndex((canv) => canv.id === canvasId);
  const prevCanvasIndex: number = canvasIndex && canvasIndex > 0 ? Number(canvasIndex - 1) : 0;

  function onDeleteCanvas() {
    editingStack.close(); // close the deleted canvas
    const newCanvases = items.get(); // refresh canvases

    if (newCanvases && newCanvases.length > 0) {
      canvasActions.edit(newCanvases[prevCanvasIndex]);
    } else {
      canvasActions.edit(manifest);
    }
  }

  return (
    <SidebarContent>
      <ThumbnailGridContainer>
        <CanvasGrid
          id={items.focusId()}
          list={items.get() || []}
          inlineHandle={false}
          activeId={canvas?.resource.source.id}
          reorder={isEditing ? (t: any) => items.reorder(t.startIndex, t.endIndex) : undefined}
          onSelect={(item: any, idx: number) => {
            open({ id: "current-canvas" });
            canvasActions.edit(item, idx);
          }}
          createActions={createAppActions(items, onDeleteCanvas)}
        />
      </ThumbnailGridContainer>
    </SidebarContent>
  );
}

export function CanvasListView({ isEditing }: { isEditing: boolean }) {
  const { canvas, items, canvasActions, open } = useEditCanvasItems();
  const manifest = useManifest();
  const editingStack = useEditingStack();
  const canvases = items.get();
  const canvasId = canvas?.resource.source.id;

  // Find current canvas to get its index before deleting it
  const canvasIndex = canvases.findIndex((canv) => canv.id === canvasId);
  const prevCanvasIndex: number = canvasIndex && canvasIndex > 0 ? Number(canvasIndex - 1) : 0;

  function onDeleteCanvas() {
    editingStack.close(); // close the deleted canvas
    const newCanvases = items.get(); // refresh canvases

    if (newCanvases && newCanvases.length > 0) {
      canvasActions.edit(newCanvases[prevCanvasIndex]);
    } else {
      canvasActions.edit(manifest);
    }
  }

  return (
    <SidebarContent className="p-3">
      <InputContainer $wide>
        <CanvasList
          id={items.focusId()}
          list={items.get() || []}
          inlineHandle={false}
          activeId={canvas?.resource.source.id}
          reorder={isEditing ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
          onSelect={(item, idx) => {
            open({ id: "current-canvas" });
            canvasActions.edit(item, idx);
          }}
          createActions={createAppActions(items, onDeleteCanvas)}
        />
      </InputContainer>
    </SidebarContent>
  );
}

export function ListEditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
    </svg>
  );
}

export function CanvasThumbnailsIcon() {
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

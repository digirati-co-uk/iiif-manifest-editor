import {
  InputContainer,
  InputLabel,
  InputLabelEdit,
  useInStack,
  useToggleList,
  CanvasList,
  createAppActions,
} from "@manifest-editor/editors";
import { LayoutPanel, useCreator, useLayoutActions, useManifestEditor } from "@manifest-editor/shell";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { SVGProps, useEffect } from "react";
import { CreateCanvasIcon, SidebarHeader } from "@manifest-editor/components";

const ListingIcon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & { title?: string; titleId?: string }) => (
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
  icon: <ListingIcon />,
  render: (state, ctx, app) => {
    return <CanvasListing />;
  },
};

export function CanvasListing() {
  const { edit, open } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const [toggled, toggle] = useToggleList();
  const canvas = useInStack("Canvas");
  const { items } = structural;
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Canvas");

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

  return (
    <div className="w-full h-full">
      <SidebarHeader
        title="Canvases"
        actions={[
          {
            icon: <ListEditIcon />,
            title: "Edit canvases",
            onClick: () => toggle("items"),
          },
          {
            icon: <CreateCanvasIcon />,
            title: "Add new canvas",
            onClick: () => canvasActions.create(),
            disabled: !canCreateCanvas,
          },
        ]}
      />
      <PaddedSidebarContainer>
        <InputContainer $wide>
          <CanvasList
            id={items.focusId()}
            list={items.get() || []}
            inlineHandle={false}
            activeId={canvas?.resource.source.id}
            reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
            onSelect={(item, idx) => {
              open({ id: "current-canvas" });
              canvasActions.edit(item, idx);
            }}
            createActions={createAppActions(items)}
          />
        </InputContainer>
      </PaddedSidebarContainer>
    </div>
  );
}

function ListEditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
    </svg>
  );
}

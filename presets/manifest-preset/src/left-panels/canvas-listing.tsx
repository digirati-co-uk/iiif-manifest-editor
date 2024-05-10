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
      }
    }
  }, []);

  return (
    <div className="w-full h-full">
      <div className="bg-[#F5F5F5] h-12 flex items-center px-3 border-b sticky top-0 z-10">
        <div className="flex-1">Canvases</div>
        <div className="ml-auto flex gap-2 items-center">
          <button
            className={`p-1 rounded hover:bg-slate-200 ${toggled.items ? "bg-slate-200" : ""}`}
            onClick={() => toggle("items")}
            title="Edit canvases"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
            </svg>
          </button>
          <button
            className="p-1 rounded hover:bg-slate-200"
            {...canvasActions.buttonProps}
            onClick={() => canvasActions.create()}
            title="Add new canvas"
            disabled={!canCreateCanvas}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M13 11h-2v3H8v2h3v3h2v-3h3v-2h-3zm1-9H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <PaddedSidebarContainer>
        {/*<div>*/}
        {/*  <Button onClick={() => open("@manifest-editor/tutorial")}>Open tutorial</Button>*/}
        {/*</div>*/}

        <InputContainer $wide>
          {/* {!items.get()?.length ? (
            <>
              <InputLabel>Canvases</InputLabel>
              <EmptyState $noMargin $box>
                No canvases
              </EmptyState>
            </>
          ) : (
            <InputLabel>
              Canvases
              <InputLabelEdit data-active={toggled.items} onClick={() => toggle("items")} />
            </InputLabel>
          )} */}
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

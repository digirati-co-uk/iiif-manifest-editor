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
    width="1em"
    height="1em"
    viewBox="0 -960 960 960"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M280-600v-80h560v80H280Zm0 160v-80h560v80H280Zm0 160v-80h560v80H280ZM160-600q-17 0-28.5-11.5T120-640q0-17 11.5-28.5T160-680q17 0 28.5 11.5T200-640q0 17-11.5 28.5T160-600Zm0 160q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520q17 0 28.5 11.5T200-480q0 17-11.5 28.5T160-440Zm0 160q-17 0-28.5-11.5T120-320q0-17 11.5-28.5T160-360q17 0 28.5 11.5T200-320q0 17-11.5 28.5T160-280Z" />
  </svg>
);

export const canvasListing: LayoutPanel = {
  id: "left-panel-empty",
  label: "Left panel",
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
    <PaddedSidebarContainer>
      {canCreateCanvas ? (
        <Button {...canvasActions.buttonProps} onClick={() => canvasActions.create()}>
          Add new canvas
        </Button>
      ) : null}

      {/*<div>*/}
      {/*  <Button onClick={() => open("@manifest-editor/tutorial")}>Open tutorial</Button>*/}
      {/*</div>*/}

      <InputContainer $wide>
        {!items.get()?.length ? (
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
        )}
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
  );
}

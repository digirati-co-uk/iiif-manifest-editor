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

export const canvasListing: LayoutPanel = {
  id: "left-panel-empty",
  label: "Left panel",
  icon: "",
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

  return (
    <PaddedSidebarContainer>
      <div>{manifest ? <Button onClick={() => edit(manifest)}>Edit manifest</Button> : null}</div>

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
          onSelect={(item, idx) => canvasActions.edit(item, idx)}
          createActions={createAppActions(items)}
        />
      </InputContainer>
      {canCreateCanvas ? (
        <Button {...canvasActions.buttonProps} onClick={() => canvasActions.create()}>
          Add canvas
        </Button>
      ) : null}
    </PaddedSidebarContainer>
  );
}

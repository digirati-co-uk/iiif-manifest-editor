import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { Button } from "@/atoms/Button";
import { useManifestEditor } from "@/shell/EditingStack/EditingStack";
import { InputContainer, InputLabel, InputLabelEdit } from "@/editors/Input";
import { EmptyState } from "@/madoc/components/EmptyState";
import { CanvasList } from "@/_components/ui/CanvasList/CanvasList";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { useToggleList } from "@/_editors/LinkingProperties/LinkingProperties";
import { useCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { useInStack } from "@/_components/ui/CanvasPanelEditor/CanvasPanelEditor";

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

      <div>
        <Button onClick={() => open("@manifest-editor/tutorial")}>Open tutorial</Button>
      </div>

      <InputContainer wide>
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

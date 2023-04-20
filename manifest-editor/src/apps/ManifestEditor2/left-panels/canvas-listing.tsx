import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { useManifest } from "react-iiif-vault";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { Button } from "@/atoms/Button";
import { ReorderList } from "@/_components/ui/ReorderList/ReorderList.dndkit";
import invariant from "tiny-invariant";
import { useManifestEditor } from "@/shell/EditingStack/EditingStack";
import { InputContainer, InputLabel, InputLabelEdit } from "@/editors/Input";
import { EmptyState } from "@/madoc/components/EmptyState";
import { CanvasList } from "@/_components/ui/CanvasList/CanvasList";
import { createAppActions } from "@/_editors/LinkingProperties/LinkingProperties.helpers";
import { useToggleList } from "@/_editors/LinkingProperties/LinkingProperties";
import { useCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";

export const canvasListing: LayoutPanel = {
  id: "left-panel-empty",
  label: "Left panel",
  icon: "",
  render: (state, ctx, app) => {
    return <CanvasListing />;
  },
};

export function CanvasListing() {
  const { edit, create } = useLayoutActions();
  const { structural, technical } = useManifestEditor();
  const [toggled, toggle] = useToggleList();
  const { items } = structural;
  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };
  const [canCreateCanvas, canvasActions] = useCreator(manifest, "items", "Canvas");

  return (
    <PaddedSidebarContainer>
      <div>{manifest ? <Button onClick={() => edit(manifest)}>Edit manifest</Button> : null}</div>

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
          reorder={toggled.items ? (t) => items.reorder(t.startIndex, t.endIndex) : undefined}
          onSelect={(item, idx) => canvasActions.edit(item, idx)}
          createActions={createAppActions(items)}
        />
      </InputContainer>
      {canCreateCanvas ? <Button onClick={() => canvasActions.create()}>Add canvas</Button> : null}
    </PaddedSidebarContainer>
  );
}

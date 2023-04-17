import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { useManifest } from "react-iiif-vault";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { Button } from "@/atoms/Button";
import { ReorderList } from "@/_components/ui/ReorderList/ReorderList.dndkit";
import invariant from "tiny-invariant";
import { useManifestEditor } from "@/shell/EditingStack/EditingStack";

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

  const manifestId = technical.id.get();
  const manifest = { id: manifestId, type: "Manifest" };

  return (
    <div>
      <div>{manifest ? <Button onClick={() => edit(manifest)}>Edit manifest</Button> : null}</div>

      <div>
        {manifest ? (
          <Button onClick={() => create({ type: "ContentResource", parent: manifest, property: "seeAlso" })}>
            Create thing.
          </Button>
        ) : null}

        {manifest ? (
          <Button onClick={() => create({ type: "Canvas", parent: manifest, property: "items" })}>
            Create canvas.
          </Button>
        ) : null}
      </div>

      <ReorderList
        id="canvas-list"
        items={structural.items.get() || []}
        inlineHandle={false}
        reorder={(ctx) => structural.items.reorder(ctx.startIndex, ctx.endIndex)}
        renderItem={(item, index) => (
          <li key={item.id}>
            {item.id}{" "}
            <button onClick={() => edit(item, { parent: manifest, index, property: "items" }, { reset: true })}>
              edit
            </button>
          </li>
        )}
      />
    </div>
  );
}

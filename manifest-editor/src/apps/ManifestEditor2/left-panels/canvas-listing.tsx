import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { useManifest } from "react-iiif-vault";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { Button } from "@/atoms/Button";

export const canvasListing: LayoutPanel = {
  id: "left-panel-empty",
  label: "Left panel",
  icon: "",
  render: (state, ctx, app) => {
    return <CanvasListing />;
  },
};

export function CanvasListing() {
  const manifest = useManifest();
  const { edit } = useLayoutActions();

  return (
    <ul>
      <li>{manifest ? <Button onClick={() => edit(manifest)}>Edit manifest</Button> : null}</li>
      {manifest?.items.map((item, index) => (
        <li key={item.id}>
          {item.id}{" "}
          <button
            onClick={() =>
              edit(item, { parent: { id: manifest.id, type: "Manifest" }, index, property: "items" }, { reset: true })
            }
          >
            edit
          </button>
        </li>
      ))}
    </ul>
  );
}

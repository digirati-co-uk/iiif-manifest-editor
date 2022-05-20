import { useCanvas } from "react-iiif-vault";
import { getValue } from "@iiif/vault-helpers";
import { useLayoutProvider } from "../../../shell/Layout/Layout.context";

export function SingleCanvas({ selected }: { selected: boolean }) {
  const canvas = useCanvas();
  const { actions } = useLayoutProvider();

  if (!canvas) {
    return null;
  }

  return (
    <div style={{ fontWeight: selected ? 600 : 400 }}>
      Canvas: {getValue(canvas.label)}
      <button
        disabled={selected}
        style={{ marginLeft: 10 }}
        onClick={() => {
          actions.rightPanel.open({ id: "label-editor", state: { id: canvas.id, type: "Canvas" } });
        }}
      >
        edit label
      </button>
    </div>
  );
}

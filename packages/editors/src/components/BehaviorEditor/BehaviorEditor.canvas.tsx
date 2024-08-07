import { useCanvas, useManifest, useVault } from "react-iiif-vault";

import { BehaviorEditor } from "./BehaviorEditor";

export function BehaviorEditorCanvas() {
  const canvas = useCanvas();
  const vault = useVault();

  if (!canvas) {
    return null;
  }

  const onChange = (newValue: string[]) => {
    vault.modifyEntityField(canvas, "behavior", newValue);
  };

  return <BehaviorEditor behavior={canvas.behavior as string[]} onChange={onChange} configs={[]} />;
}

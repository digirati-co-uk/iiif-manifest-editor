import { useManifest, useVault } from "react-iiif-vault/presentation-4";

import { BehaviorEditor } from "./BehaviorEditor";

export function BehaviorEditorManifest() {
  const manifest = useManifest();
  const vault = useVault();

  if (!manifest) {
    return null;
  }

  const onChange = (newValue: string[]) => {
    vault.modifyEntityField(manifest, "behavior", newValue);
  };

  return <BehaviorEditor behavior={manifest.behavior as string[]} onChange={onChange} configs={[]} />;
}

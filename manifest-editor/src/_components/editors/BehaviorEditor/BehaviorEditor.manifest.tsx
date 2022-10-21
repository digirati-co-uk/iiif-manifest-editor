import { useManifest, useVault } from "react-iiif-vault";

import { BehaviorEditor } from "@/_components/editors/BehaviorEditor/BehaviorEditor";

export function BehaviorEditorManifest() {
  const manifest = useManifest();
  const vault = useVault();

  if (!manifest) {
    return null;
  }

  const onChange = (newValue: string[]) => {
    vault.modifyEntityField(manifest, "behavior", newValue);
  };

  return <BehaviorEditor behavior={manifest.behavior} onChange={onChange} configs={[]} />;
}

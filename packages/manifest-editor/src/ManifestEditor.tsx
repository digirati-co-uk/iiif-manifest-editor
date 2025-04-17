import type { Vault } from "@iiif/helpers";
import type { Collection, Manifest } from "@iiif/presentation-3";
import { collectionPreset } from "@manifest-editor/collection-preset";
import * as manifestEditorPreset from "@manifest-editor/manifest-preset";
import { AppProvider, Layout, ShellProvider, mapApp } from "@manifest-editor/shell";
import { VaultProvider, useExistingVault } from "react-iiif-vault";
import invariant from "tiny-invariant";

const manifestEditor = mapApp(manifestEditorPreset);

interface ManifestEditorProps {
  resource: { id: string; type: "Manifest" | "Collection" };
  data?: Manifest | Collection;
  vault?: Vault;

  // // Future bits.
  // onChange?: (resource: { id: string; type: "Manifest" | "Collection" }, vault: Vault) => void;
  // onSave?: (data: Manifest | Collection) => void;
  // config?: any;
  // appState?: any;
  // previews?: PreviewConfiguration[];
}

export function ManifestEditor(props: ManifestEditorProps) {
  const vault = useExistingVault(props.vault);

  invariant(props.resource);
  invariant(props.data, "Data is required");

  if (!vault.requestStatus(props.resource.id)) {
    vault.loadManifestSync(props.resource.id, props.data);
  }

  let preset = null;
  let appId = null;

  if (props.resource.type === "Manifest") {
    preset = manifestEditor;
    appId = manifestEditor.metadata.id;
  } else if (props.resource.type === "Collection") {
    preset = collectionPreset;
    appId = collectionPreset.metadata.id;
  }

  if (preset === null || appId === null) {
    return null;
  }

  return (
    <AppProvider appId={appId} definition={preset} instanceId="test-1">
      <VaultProvider vault={vault}>
        <ShellProvider resource={props.resource}>
          <Layout />
        </ShellProvider>
      </VaultProvider>
    </AppProvider>
  );
}

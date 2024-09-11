import { Vault } from "@iiif/helpers";
import { Collection, Manifest } from "@iiif/presentation-3";
import { AppProvider, Layout, ShellProvider, mapApp } from "@manifest-editor/shell";
import * as manifestEditorPreset from "@manifest-editor/manifest-preset";
import { useExistingVault, VaultProvider } from "react-iiif-vault";
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
  invariant(props.resource.type === "Manifest", "Only Manifests are supported at the moment");

  if (!vault.requestStatus(props.resource.id)) {
    vault.loadManifestSync(props.resource.id, props.data);
  }

  return (
    <AppProvider appId="manifest-editor" definition={manifestEditor} instanceId="test-1">
      <VaultProvider vault={vault}>
        <ShellProvider resource={props.resource}>
          <Layout />
        </ShellProvider>
      </VaultProvider>
    </AppProvider>
  );
}

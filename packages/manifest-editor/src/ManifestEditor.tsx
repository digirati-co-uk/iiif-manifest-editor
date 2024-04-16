import { Vault } from "@iiif/helpers";
import { Collection, Manifest } from "@iiif/presentation-3";
import { AppProvider, Layout, MappedApp, PreviewConfiguration, ShellProvider } from "@manifest-editor/shell";
import invariant from "tiny-invariant";
import { useExistingVault, VaultProvider } from "react-iiif-vault";
import * as _manifestEditor from "@manifest-editor/manifest-preset";
import { GlobalStyle } from "@manifest-editor/ui/GlobalStyle";

const { default: metadata, ...props } = _manifestEditor;
const manifestEditor: MappedApp = {
  metadata: metadata as any,
  layout: {
    leftPanels: [],
    rightPanels: [],
    centerPanels: [],
    ...(props as any),
  },
};

interface ManifestEditorProps {
  resource: { id: string; type: "Manifest" | "Collection" };
  data?: Manifest | Collection;
  vault?: Vault;
  onChange?: (resource: { id: string; type: "Manifest" | "Collection" }, vault: Vault) => void;
  onSave?: (data: Manifest | Collection) => void;

  // Future bits.
  config?: any;
  appState?: any;
  previews?: PreviewConfiguration[];
}

// This will do the following:
// - Choose the Manifest preset if its a Manifest
// - Choose the Collection preset if its a Collection
// - Set up the AppProvider
// - Load the resource
// - Set up the Vault
// - Construct the Layout
// - Create an instance ID randomly

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
          <GlobalStyle />
          <Layout />
        </ShellProvider>
      </VaultProvider>
    </AppProvider>
  );
}

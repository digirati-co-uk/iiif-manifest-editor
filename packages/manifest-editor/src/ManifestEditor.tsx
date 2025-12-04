import type { Vault } from "@iiif/helpers";
import type { Collection, Manifest } from "@iiif/presentation-3";
import { collectionPreset } from "@manifest-editor/collection-preset";
import * as manifestEditorPreset from "@manifest-editor/manifest-preset";
import { AppProvider, Layout, mapApp, ShellProvider } from "@manifest-editor/shell";
import { useRef } from "react";
import { useExistingVault, VaultProvider } from "react-iiif-vault";
import invariant from "tiny-invariant";

const manifestEditor = mapApp(manifestEditorPreset);

interface ManifestEditorProps {
  resource: string | { id: string; type: "Manifest" | "Collection" };
  data?: Manifest | Collection;
  vault?: Vault;

  // // Future bits.
  // onChange?: (resource: { id: string; type: "Manifest" | "Collection" }, vault: Vault) => void;
  // onSave?: (data: Manifest | Collection) => void;
  // config?: any;
  // appState?: any;
  // previews?: PreviewConfiguration[];
}

function configInvariant(
  condition: any,
  // Not providing an inline default argument for message as the result is smaller
  /**
   * Can provide a string, or a function that returns a string for cases where
   * the message takes a fair amount of effort to compute
   */
  message?: string | (() => string),
): asserts condition {
  if (condition) {
    return;
  }
  const prefix: string = "Configuration Error";

  const provided: string | undefined = typeof message === "function" ? message() : message;
  const value: string = provided ? `${prefix}: ${provided}` : prefix;
  throw new Error(value);
}

export function ManifestEditor(props: ManifestEditorProps) {
  const vault = useExistingVault(props.vault);
  const didLoad = useRef("");

  configInvariant(
    props.resource,
    `Prop resource is required. Usage example:
  <ManifestEditor resource="https://example.org/manifest" />
`,
  );

  const resource = typeof props.resource === "string" ? { id: props.resource, type: "Manifest" } : props.resource;

  if (!vault.requestStatus(resource.id)) {
    if (props.data) {
      vault.loadManifestSync(resource.id, props.data);
    } else {
      if (didLoad.current !== resource.id) {
        vault.load(resource);
        didLoad.current = resource.id;
      }
    }
  }

  let preset = null;
  let appId = null;

  if (resource.type === "Manifest") {
    preset = manifestEditor;
    appId = manifestEditor.metadata.id;
  } else if (resource.type === "Collection") {
    preset = collectionPreset;
    appId = collectionPreset.metadata.id;
  }

  if (preset === null || appId === null) {
    return null;
  }

  return (
    <AppProvider appId={appId} definition={preset} instanceId="test-1">
      <VaultProvider vault={vault}>
        <ShellProvider resource={resource}>
          <Layout />
        </ShellProvider>
      </VaultProvider>
    </AppProvider>
  );
}

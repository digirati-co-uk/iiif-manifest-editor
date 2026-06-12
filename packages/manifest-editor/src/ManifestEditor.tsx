import type { Vault } from "@iiif/helpers";
import type { Collection, Manifest } from "@iiif/presentation-3";
import { collectionPreset } from "@manifest-editor/collection-preset";
import * as manifestEditorPreset from "@manifest-editor/manifest-preset";
import {
  AppProvider,
  type Config,
  Layout,
  mapApp,
  type PluginInput,
  PluginProvider,
  ShellProvider,
} from "@manifest-editor/shell";
import { useRef } from "react";
import { useExistingVault, VaultProvider } from "react-iiif-vault";
import invariant from "tiny-invariant";

const manifestEditor = mapApp(manifestEditorPreset);

export interface ManifestEditorProps {
  resource: string | { id: string; type: "Manifest" | "Collection" };
  data?: Manifest | Collection;
  vault?: Vault;
  config?: Partial<Config>;
  saveConfig?: (config: Partial<Config>) => void;
  globalPluginConfig?: Config["plugins"];
  saveGlobalPluginConfig?: (config: Config["plugins"]) => void | Promise<void>;
  plugins?: PluginInput[];
  enabledPlugins?: string[];
  disabledPlugins?: string[];
  layoutMode?: "default" | "focused";

  // // Future bits.
  // onChange?: (resource: { id: string; type: "Manifest" | "Collection" }, vault: Vault) => void;
  // onSave?: (data: Manifest | Collection) => void;
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

  const provided: string | undefined =
    typeof message === "function" ? message() : message;
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

  const resource =
    typeof props.resource === "string"
      ? { id: props.resource, type: "Manifest" }
      : props.resource;

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

  const plugins =
    resource.type === "Manifest"
      ? [...(manifestEditorPreset.plugins || []), ...(props.plugins || [])]
      : props.plugins || [];

  return (
    <PluginProvider
      plugins={plugins}
      enabled={props.enabledPlugins}
      disabled={props.disabledPlugins}
      globalPluginConfig={props.globalPluginConfig}
      saveGlobalPluginConfig={props.saveGlobalPluginConfig}
    >
      <AppProvider appId={appId} definition={preset} instanceId="test-1">
        <VaultProvider vault={vault}>
          <ShellProvider
            resource={resource}
            config={props.config}
            saveConfig={props.saveConfig}
          >
            <Layout layoutMode={props.layoutMode} />
          </ShellProvider>
        </VaultProvider>
      </AppProvider>
    </PluginProvider>
  );
}

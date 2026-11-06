import type { Vault } from "@iiif/helpers";
import type { Collection, Manifest } from "@iiif/presentation-3";
import { collectionPreset } from "@manifest-editor/collection-preset";
import * as manifestEditorPreset from "@manifest-editor/manifest-preset";
import {
  createManifestEditorVault,
  AppProvider,
  type Config,
  Layout,
  mapApp,
  type PluginInput,
  PluginProvider,
  ShellProvider,
  type ShellLocalisation,
} from "@manifest-editor/shell";
import { useContext, useEffect, useMemo, useRef } from "react";
import { ReactVaultContext, VaultProvider } from "react-iiif-vault";

const manifestEditor = mapApp(manifestEditorPreset);

export interface ManifestEditorProps {
  resource: string | { id: string; type: "Manifest" | "Collection" };
  data?: Manifest | Collection;
  vault?: Vault;
  config?: Partial<Config>;
  /** UI resources/loaders and runtime options; never persisted with Config. */
  localisation?: ShellLocalisation;
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
  message?: string | (() => string)
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
  const resourceKey =
    typeof props.resource === "string" ? `Manifest:${props.resource}` : `${props.resource.type}:${props.resource.id}`;
  const inherited = useContext(ReactVaultContext).vault;
  const hostVault = props.vault || (inherited?.presentationVersion === 3 ? inherited : undefined);
  const ownedVault = useMemo(() => (hostVault ? null : createManifestEditorVault()), [hostVault, resourceKey]);
  const vault = hostVault || ownedVault!;
  const lifetimes = useRef(new Map<Vault, number>());
  useEffect(() => {
    if (!ownedVault) return;
    const generation = (lifetimes.current.get(ownedVault) || 0) + 1;
    lifetimes.current.set(ownedVault, generation);
    return () => {
      ownedVault.history?.clear();
      queueMicrotask(() => {
        if (lifetimes.current.get(ownedVault) === generation) {
          ownedVault.history?.dispose();
          lifetimes.current.delete(ownedVault);
        }
      });
    };
  }, [ownedVault]);
  const didLoad = useRef<{ vault: Vault; id: string } | null>(null);

  configInvariant(
    props.resource,
    `Prop resource is required. Usage example:
  <ManifestEditor resource="https://example.org/manifest" />
`
  );

  const resource = typeof props.resource === "string" ? { id: props.resource, type: "Manifest" } : props.resource;

  if (!vault.requestStatus(resource.id)) {
    if (props.data) {
      vault.loadManifestSync(resource.id, props.data);
    } else {
      if (didLoad.current?.vault !== vault || didLoad.current.id !== resource.id) {
        vault.load(resource);
        didLoad.current = { vault, id: resource.id };
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
            localisation={props.localisation}
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

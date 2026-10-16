import { useEffect, useState } from "react";
import type { EditorRuntime } from "../../../../../packages/manifest-editor/src/remote/loader";
import type { Config } from "@manifest-editor/shell";

export type DemoPreset = "manifest" | "collection" | "exhibition" | "template";

// All ME values come from the selected runtime; only React and types come from the host.
export function createDemo(
  runtime: EditorRuntime,
  preset: DemoPreset,
  onDirty: () => void,
  onExport: (data: unknown) => void
) {
  const { AppProvider, ShellProvider, PluginProvider, Layout, mapApp, useConfig, useSaveConfig } = runtime.shell;
  const { VaultProvider } = runtime.vault;
  const vault = new runtime.Vault();
  const resource = {
    id: "https://example.org/remote-editor/demo",
    type: preset === "collection" ? ("Collection" as const) : ("Manifest" as const),
  };
  const data = {
    ...resource,
    "@context": "http://iiif.io/api/presentation/3/context.json",
    label: { en: [`Remote ${preset} demo`] },
    items: [],
  };
  if (resource.type === "Collection") vault.loadCollectionSync(resource.id, { ...data, type: "Collection" });
  else vault.loadManifestSync(resource.id, { ...data, type: "Manifest" });

  function HostConfiguration() {
    const config = useConfig();
    const saveConfig = useSaveConfig();
    return (
      <div style={{ padding: 16 }}>
        <h2>Host configuration</h2>
        <p>This host component uses hooks from the remote runtime.</p>
        <label>
          Default language
          <select
            value={config.i18n.defaultLanguage}
            onChange={(event) =>
              saveConfig({ ...config, i18n: { ...config.i18n, defaultLanguage: event.target.value } })
            }
          >
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </label>
      </div>
    );
  }

  const base =
    preset === "collection"
      ? runtime.collectionPreset.collectionPreset
      : preset === "exhibition"
        ? runtime.exhibitionPreset.exhibitionEditorPreset
        : mapApp(runtime.manifestPreset);
  const emptyCanvas = runtime.creators.allCreators.find((creator) => creator.id === "@manifest-editor/empty-canvas");
  const definition = {
    ...base,
    layout: {
      ...base.layout,
      creators:
        preset === "template"
          ? []
          : [
              ...(emptyCanvas && preset !== "collection"
                ? [
                    {
                      ...emptyCanvas,
                      id: "@remote-demo/canvas",
                      label: "POC canvas",
                      summary: "A creator configured by the host",
                    },
                  ]
                : []),
              ...(base.layout.creators || []),
            ],
      leftPanels: [
        ...base.layout.leftPanels,
        { id: "host-config", label: "Host config", icon: <span>⚙</span>, render: () => <HostConfiguration /> },
      ],
    },
  };

  return function DemoEditor() {
    const [config, setConfig] = useState<Partial<Config>>({
      i18n: { defaultLanguage: "en", availableLanguages: ["en", "fr"], advancedLanguageMode: false },
    });
    useEffect(() => vault.subscribe(onDirty, true), []);
    return (
      <PluginProvider plugins={runtime.manifestPreset.plugins}>
        <AppProvider appId={definition.metadata.id} definition={definition} instanceId={resource.id}>
          <VaultProvider vault={vault}>
            <ShellProvider resource={resource} config={config} saveConfig={setConfig}>
              <Layout
                header={
                  <div
                    style={{
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Host toolbar · {preset} preset</span>
                    <button
                      type="button"
                      className="remote-demo-button"
                      onClick={() => onExport(vault.toPresentation3(resource))}
                    >
                      Inspect JSON
                    </button>
                  </div>
                }
              />
            </ShellProvider>
          </VaultProvider>
        </AppProvider>
      </PluginProvider>
    );
  };
}

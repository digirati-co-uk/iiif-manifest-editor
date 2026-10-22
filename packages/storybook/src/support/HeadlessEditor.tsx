import { loadResource, type LoadedResource } from "./load-resource";
import * as manifestPreset from "@manifest-editor/manifest-preset";
import {
  AppProvider,
  PluginProvider,
  ShellProvider,
  mapApp,
  type Config,
  type MappedApp,
} from "@manifest-editor/shell";
import { useEffect, useId, useState, type ReactNode } from "react";
import { VaultProvider } from "react-iiif-vault";

const defaultApp = mapApp(manifestPreset);
const storyConfig: Partial<Config> = {
  urlState: { getSearchParam: () => null, replaceSearchParam: () => {} },
  editorFeatureFlags: { rememberCanvasId: false, rememberLeftPanelId: false },
};
export { loadResource, type LoadedResource } from "./load-resource";

export function RemoteResource({ url, children }: { url: string; children: (loaded: LoadedResource) => ReactNode }) {
  const [state, setState] = useState<{ url: string; loaded?: LoadedResource; error?: string }>();
  const [attempt, retry] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setState({ url });
    loadResource(url, abort.signal).then(
      (loaded) => {
        if (!abort.signal.aborted) setState({ url, loaded });
      },
      (error) => {
        if (!abort.signal.aborted) setState({ url, error: String(error.message || error) });
      }
    );
    return () => abort.abort();
  }, [url, attempt]);
  if (state?.url === url && state.error)
    return (
      <div className="sb-status" role="alert">
        <p>{state.error}</p>
        <a href={url} target="_blank" rel="noreferrer">
          Open source
        </a>{" "}
        <button className="sb-button" onClick={() => retry((n) => n + 1)}>
          Retry
        </button>
      </div>
    );
  if (state?.url !== url || !state.loaded)
    return (
      <output className="sb-status" style={{ display: "block" }}>
        Loading IIIF resource…
      </output>
    );
  return children(state.loaded);
}

export function EditorProviders({
  loaded,
  app = defaultApp,
  config,
  children,
}: {
  loaded: LoadedResource;
  app?: MappedApp;
  config?: Partial<Config>;
  children: ReactNode;
}) {
  const instanceId = useId();
  return (
    <PluginProvider plugins={manifestPreset.plugins}>
      <AppProvider appId={app.metadata.id} definition={app} instanceId={`storybook-${instanceId}`}>
        <VaultProvider vault={loaded.vault}>
          <ShellProvider
            resource={loaded.resource}
            config={{ ...storyConfig, ...config }}
            backgroundActionPersistence={false}
          >
            {children}
          </ShellProvider>
        </VaultProvider>
      </AppProvider>
    </PluginProvider>
  );
}

export function HeadlessEditor({
  resource,
  app,
  config,
  children,
}: {
  resource: string;
  app?: MappedApp;
  config?: Partial<Config>;
  children: ReactNode | ((loaded: LoadedResource) => ReactNode);
}) {
  return (
    <RemoteResource url={resource}>
      {(loaded) => (
        <EditorProviders loaded={loaded} app={app} config={config}>
          {typeof children === "function" ? children(loaded) : children}
        </EditorProviders>
      )}
    </RemoteResource>
  );
}

import { validateCatalog, type RemoteRelease } from "./releases";

export type EditorRuntime = typeof import("../../browser/entry");
export interface RuntimeHost {
  react: typeof import("react");
  "react-reconciler": unknown;
  "react-dom": typeof import("react-dom");
  "react-dom/client": typeof import("react-dom/client");
  "react-dom/server": typeof import("react-dom/server");
  "react-dom/server.browser": typeof import("react-dom/server");
  "react/jsx-runtime": typeof import("react/jsx-runtime");
}

type Factory = (host: RuntimeHost) => EditorRuntime;
export interface BrowserRuntimeOptions {
  React: RuntimeHost["react"];
  ReactDOM: RuntimeHost["react-dom"];
  ReactDOMClient: RuntimeHost["react-dom/client"];
  ReactDOMServer: RuntimeHost["react-dom/server"];
  jsxRuntime: RuntimeHost["react/jsx-runtime"];
  ReactReconciler: RuntimeHost["react-reconciler"];
}
export interface BrowserRuntimeApi {
  readonly version: string;
  readonly buildId: string;
  createRuntime(host: BrowserRuntimeOptions): EditorRuntime;
  automaticRuntime(): Promise<EditorRuntime & {
    React: RuntimeHost["react"];
    ReactDOM: RuntimeHost["react-dom"];
    ReactDOMClient: RuntimeHost["react-dom/client"];
  }>;
}
declare global {
  var __manifestEditorFactories: Record<string, Factory> | undefined;
  var ManifestEditor: BrowserRuntimeApi;
}

const scripts = new Map<string, Promise<Factory>>();
const runtimes = new WeakMap<RuntimeHost["react"], Map<string, EditorRuntime>>();

function appendVerified(element: HTMLScriptElement | HTMLLinkElement) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error("Remote editor asset timed out")), 30_000);
    function finish(error?: Error) {
      clearTimeout(timer);
      element.onload = null;
      element.onerror = null;
      if (error) {
        element.remove();
        reject(error);
      } else resolve();
    }
    element.crossOrigin = "anonymous";
    element.onload = () => finish();
    element.onerror = () => finish(new Error("Remote editor asset failed to load or failed its integrity check"));
    document.head.appendChild(element);
  });
}

/** Load only descriptors received from your trusted release resolver. */
export async function loadManifestEditor(release: RemoteRelease, host: RuntimeHost) {
  validateCatalog({ releases: [release], latest: null });
  if (release.runtimeApiVersion !== 1 || Number(host.react.version.split(".")[0]) !== release.reactMajor) {
    throw new Error("Remote editor is incompatible with this host");
  }
  const key = `${release.script.url}:${release.script.integrity}`;
  let scriptPromise = scripts.get(key);
  if (!scriptPromise) {
    const script = document.createElement("script");
    script.src = release.script.url;
    script.integrity = release.script.integrity;
    scriptPromise = appendVerified(script)
      .then(() => {
        script.remove();
        const factory = globalThis.__manifestEditorFactories?.[release.buildId];
        if (typeof factory !== "function") throw new Error("Remote editor did not register its runtime");
        return factory;
      })
      .catch((error) => {
        scripts.delete(key);
        throw error;
      });
    scripts.set(key, scriptPromise);
  }

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = release.stylesheet.url;
  stylesheet.integrity = release.stylesheet.integrity;
  try {
    const [factory] = await Promise.all([scriptPromise, appendVerified(stylesheet)]);
    let instances = runtimes.get(host.react);
    if (!instances) runtimes.set(host.react, (instances = new Map()));
    let runtime = instances.get(key);
    if (!runtime) {
      runtime = factory(host);
      if (
        runtime.runtimeApiVersion !== 1 ||
        typeof runtime.shell?.mapApp !== "function" ||
        typeof runtime.Vault !== "function"
      ) {
        throw new Error("Remote editor exports do not match runtime API 1");
      }
      instances.set(key, runtime);
    }
    return { runtime, release, dispose: () => stylesheet.remove() };
  } catch (error) {
    stylesheet.remove();
    throw error;
  }
}

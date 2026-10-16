// Kept self-contained so the bundler can embed this function in the classic script.
export function registerRuntime(target, buildId, version, factory, importModule = (url) => import(url)) {
  let automatic;
  // Existing version-selection loaders still address the exact verified build.
  target.__manifestEditorFactories ||= Object.create(null);
  target.__manifestEditorFactories[buildId] = factory;
  const api = Object.freeze({
    version,
    buildId,
    automaticRuntime() {
      automatic ||= Promise.all([
        importModule("https://esm.sh/react@19.2.8?target=es2022"),
        importModule("https://esm.sh/react-dom@19.2.8?deps=react@19.2.8&target=es2022"),
        importModule("https://esm.sh/react-dom@19.2.8/client?deps=react@19.2.8&target=es2022"),
        importModule("https://esm.sh/react-dom@19.2.8/server.browser?deps=react@19.2.8&target=es2022"),
        importModule("https://esm.sh/react@19.2.8/jsx-runtime?target=es2022"),
        importModule("https://esm.sh/react-reconciler@0.33.0?deps=react@19.2.8&target=es2022"),
      ]).then(([React, ReactDOM, ReactDOMClient, ReactDOMServer, jsxRuntime, reconciler]) => ({
        ...api.createRuntime({ React, ReactDOM, ReactDOMClient, ReactDOMServer, jsxRuntime, ReactReconciler: reconciler.default }),
        React,
        ReactDOM,
        ReactDOMClient,
      })).catch((error) => {
        automatic = undefined;
        throw error;
      });
      return automatic;
    },
    createRuntime({ React, ReactDOM, ReactDOMClient, ReactDOMServer, jsxRuntime, ReactReconciler }) {
      if (Number(React?.version?.split(".")[0]) !== 19) throw new Error("Manifest Editor requires React 19");
      const dependencies = { ReactDOM, ReactDOMClient, ReactDOMServer, jsxRuntime, ReactReconciler };
      for (const [name, value] of Object.entries(dependencies)) {
        if (!value) throw new Error(`ManifestEditor.createRuntime requires ${name}`);
      }
      return factory({
        react: React,
        "react-dom": ReactDOM,
        "react-dom/client": ReactDOMClient,
        "react-dom/server": ReactDOMServer,
        "react-dom/server.browser": ReactDOMServer,
        "react/jsx-runtime": jsxRuntime,
        "react-reconciler": ReactReconciler,
      });
    },
  });
  target.ManifestEditor = api;
}

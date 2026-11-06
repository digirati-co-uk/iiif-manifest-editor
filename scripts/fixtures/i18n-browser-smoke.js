import * as React from "/modules/react.js";
import * as ReactDOM from "/modules/dom.js";
import * as ReactDOMClient from "/modules/client.js";
import * as ReactDOMServer from "/modules/server.js";
import * as jsxRuntime from "/modules/jsx.js";
import ReactReconciler from "/modules/reconciler.js";
import * as I18n from "/modules/i18n.js";
import * as I18nCore from "/modules/core.js";
import { loadManifestEditor } from "/modules/remote.js";
import { Probe, installedPluginId } from "/plugin.js";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const waitFor = async (test) => {
  const deadline = performance.now() + 15_000;
  while (!test()) {
    if (performance.now() > deadline) throw new Error("Browser assertion timed out");
    await new Promise((done) => setTimeout(done, 20));
  }
};

try {
  const runtimeOptions = {
    I18n,
    I18nCore,
    React,
    ReactDOM,
    ReactDOMClient,
    ReactDOMServer,
    jsxRuntime,
    ReactReconciler,
  };
  const direct = window.ManifestEditor.createRuntime(runtimeOptions);
  assert(direct.i18n.EditorI18nProvider === I18n.EditorI18nProvider, "Injected provider identity");
  assert(direct.i18nCore.createEditorI18n === I18nCore.createEditorI18n, "Injected core identity");
  const automatic = await window.ManifestEditor.automaticRuntime();
  assert(automatic.i18n.EditorI18nProvider === I18n.EditorI18nProvider, "Automatic provider identity");
  assert(automatic.i18nCore.createEditorI18n === I18nCore.createEditorI18n, "Automatic core identity");
  window.smokeHost = {
    "@manifest-editor/i18n": I18n,
    "@manifest-editor/i18n/core": I18nCore,
    react: React,
    "react-dom": ReactDOM,
    "react-dom/client": ReactDOMClient,
    "react-dom/server": ReactDOMServer,
    "react-dom/server.browser": ReactDOMServer,
    "react/jsx-runtime": jsxRuntime,
    "react-reconciler": ReactReconciler,
  };
  const remote = await loadManifestEditor(window.release, window.smokeHost);
  assert(remote.runtime.i18n.EditorI18nProvider === I18n.EditorI18nProvider, "Remote provider identity");
  const second = await loadManifestEditor(window.release, window.smokeHost);
  assert(second.runtime === remote.runtime, "Remote factory cache");
  second.dispose();
  const start = performance.now();
  let loads = 0;
  let fail = true;
  const resources = {
    locales: [...I18nCore.defaultLocales, I18nCore.dutchLocale],
    resourceLoaders: [
      {
        locale: "nl",
        load: async () => {
          loads++;
          if (fail) throw new Error("Locale offline");
          const { dutchCatalogs, dutchPlain } = await import("/modules/nl.js");
          return { catalogs: dutchCatalogs, profiles: { plain: dutchPlain } };
        },
      },
    ],
  };
  const runtime = I18nCore.createEditorI18n(resources);
  const initializationMs = performance.now() - start;
  const probeRoot = ReactDOMClient.createRoot(document.getElementById("probe"));
  function Draft() {
    const [history, setHistory] = React.useState(["Teitl Cymraeg"]);
    window.editDraft = () => setHistory((values) => [...values, "Unsaved draft"]);
    window.undoDraft = () => setHistory((values) => values.slice(0, -1));
    return React.createElement("input", { id: "draft", value: history.at(-1), readOnly: true });
  }
  probeRoot.render(
    React.createElement(
      I18n.EditorI18nProvider,
      { instance: runtime },
      React.createElement(Probe),
      React.createElement(Draft)
    )
  );
  await waitFor(() => document.getElementById("plugin-probe")?.textContent === "en-GB/standard/Label");
  assert(loads === 0, "Unused locale downloaded");
  const input = document.getElementById("draft");
  window.editDraft();
  await waitFor(() => input.value === "Unsaved draft");
  try {
    await runtime.setLocale("nl");
    throw new Error("Expected failed locale");
  } catch (error) {
    assert(error.message === "Locale offline", "Locale failure did not propagate");
  }
  assert(runtime.getSnapshot().locale === "en-GB", "Failed selection committed");
  fail = false;
  await runtime.select({ locale: "nl", profile: "plain" });
  await waitFor(() => document.getElementById("plugin-probe").textContent === "nl/plain/Titel");
  await runtime.setProfile("standard");
  await waitFor(() => document.getElementById("plugin-probe").textContent === "nl/standard/Label");
  assert(loads === 2, "Locale cache did not survive profile switch");
  assert(document.getElementById("draft") === input && input.value === "Unsaved draft", "Draft remounted");
  window.undoDraft();
  await waitFor(() => input.value === "Teitl Cymraeg");
  const manifest = {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { cy: ["Teitl Cymraeg"] },
    items: [],
  };
  const vault = new remote.runtime.Vault();
  const editorRoot = ReactDOMClient.createRoot(document.getElementById("editor"));
  const render = () =>
    editorRoot.render(
      React.createElement(
        I18n.EditorI18nProvider,
        { instance: runtime },
        React.createElement(remote.runtime.ManifestEditor, {
          resource: manifest.id,
          data: manifest,
          vault,
          localisation: resources,
        })
      )
    );
  render();
  await waitFor(() => document.querySelector("#editor [data-editor-i18n]"));
  await runtime.setLocale("en-GB");
  render();
  assert(vault.get(manifest.id).label.cy[0] === "Teitl Cymraeg", "Authored content changed");
  // Exercise deferred components in the actual single-script CDN facade as well as npm builds.
  const deferred = document.createElement("div");
  document.body.append(deferred);
  const deferredRoot = ReactDOMClient.createRoot(deferred);
  const richRef = React.createRef();
  deferredRoot.render(
    React.createElement(
      I18n.EditorI18nProvider,
      { instance: runtime },
      React.createElement(remote.runtime.components.MDXEditor, { editorRef: richRef, markdown: "Teitl Cymraeg" }),
      React.createElement(remote.runtime.components.IIIFMediaPlayer, {
        canvas: { id: "https://example.org/canvas" },
        media: { duration: 10, format: "video/mp4", url: "https://example.org/video.mp4" },
      })
    )
  );
  await waitFor(() => richRef.current && deferred.querySelector("video"));
  assert(richRef.current.getMarkdown() === "Teitl Cymraeg", "Deferred CDN rich editor lost its initial content");
  const richInput = deferred.querySelector('[contenteditable="true"]');
  await runtime.setLocale("nl");
  await waitFor(() => deferred.querySelector('[aria-label="Vet"]'));
  assert(
    deferred.querySelector('[contenteditable="true"]') === richInput,
    "Deferred CDN editor remounted on locale change"
  );
  deferredRoot.unmount();
  deferred.remove();
  editorRoot.unmount();
  probeRoot.unmount();
  remote.dispose();
  window.smokeResult = {
    automatic: true,
    injected: true,
    remote: true,
    sri: true,
    installedPluginId,
    initializationMs,
    localeLoads: loads,
    deferredComponents: true,
  };
} catch (error) {
  window.smokeError = error.stack || String(error);
}

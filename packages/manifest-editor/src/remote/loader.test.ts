import * as react from "react";
import * as reactDOM from "react-dom";
import * as client from "react-dom/client";
import * as server from "react-dom/server";
import * as jsx from "react/jsx-runtime";
import * as i18n from "@manifest-editor/i18n";
import * as core from "@manifest-editor/i18n/core";
import { afterEach, expect, test, vi } from "vitest";
import { loadManifestEditor, type RuntimeHost, type EditorRuntime } from "./loader";
import type { RemoteRelease } from "./releases";

const host: RuntimeHost = {
  react,
  "react-dom": reactDOM,
  "react-dom/client": client,
  "react-dom/server": server,
  "react-dom/server.browser": server,
  "react/jsx-runtime": jsx,
  "react-reconciler": {},
  "@manifest-editor/i18n": i18n,
  "@manifest-editor/i18n/core": core,
};
afterEach(() => {
  vi.restoreAllMocks();
  document.head.replaceChildren();
  globalThis.__manifestEditorFactories = undefined;
});
let sequence = 0;
function release(): RemoteRelease {
  const buildId = String(++sequence).padStart(32, "0");
  return {
    version: "2.2.1",
    buildId,
    reactMajor: 19,
    runtimeApiVersion: 2,
    script: { url: `/remote-editor/assets/${buildId}/runtime.js`, integrity: `sha384-${"A".repeat(64)}` },
    stylesheet: { url: `/remote-editor/assets/${buildId}/runtime.css`, integrity: `sha384-${"B".repeat(64)}` },
  };
}
function assets(descriptor: RemoteRelease, factory: (modules: RuntimeHost) => EditorRuntime) {
  globalThis.__manifestEditorFactories = { [descriptor.buildId]: factory };
  const append = document.head.appendChild.bind(document.head);
  return vi.spyOn(document.head, "appendChild").mockImplementation((element) => {
    const result = append(element);
    queueMicrotask(() => element.dispatchEvent(new Event("load")));
    return result;
  });
}
// Network/SRI completion is synthetic; factories use the actual shared public modules.
// Emitted bundles and real network integrity enforcement remain release29 checks.
function runtime(modules: RuntimeHost) {
  return {
    runtimeApiVersion: 2,
    ManifestEditor() {},
    Vault() {},
    shell: { mapApp() {} },
    i18n: modules["@manifest-editor/i18n"],
    i18nCore: modules["@manifest-editor/i18n/core"],
  } as unknown as EditorRuntime;
}
test("remote loader retains exact host i18n identity, caches one host only and disposes CSS independently", async () => {
  const descriptor = release();
  const factory = vi.fn(runtime);
  const append = assets(descriptor, factory);
  const first = await loadManifestEditor(descriptor, host);
  const second = await loadManifestEditor(descriptor, host);
  expect(first.runtime).toBe(second.runtime);
  expect(first.runtime.i18n.EditorI18nProvider).toBe(i18n.EditorI18nProvider);
  expect(first.runtime.i18nCore.createEditorI18n).toBe(core.createEditorI18n);
  expect(factory).toHaveBeenCalledTimes(1);
  const alternate = { ...host, "@manifest-editor/i18n": { ...i18n } };
  const third = await loadManifestEditor(descriptor, alternate);
  expect(third.runtime).not.toBe(first.runtime);
  expect(factory).toHaveBeenCalledTimes(2);
  expect(append.mock.calls.filter(([element]) => element instanceof HTMLScriptElement)).toHaveLength(1);
  expect(document.head.querySelectorAll("link")).toHaveLength(3);
  first.dispose();
  expect(document.head.querySelectorAll("link")).toHaveLength(2);
  second.dispose();
  third.dispose();
});
test("rejects a separately bundled context and removes its stylesheet", async () => {
  const descriptor = release();
  assets(
    descriptor,
    (modules) => ({ ...runtime(modules), i18n: { ...i18n, EditorI18nProvider() {} } }) as unknown as EditorRuntime
  );
  await expect(loadManifestEditor(descriptor, host)).rejects.toThrow("runtime API 2");
  expect(document.head.querySelector("link")).toBeNull();
});
test("rejects the older browser contract before loading assets", async () => {
  const descriptor = { ...release(), runtimeApiVersion: 1 };
  const append = vi.spyOn(document.head, "appendChild");
  await expect(loadManifestEditor(descriptor, host)).rejects.toThrow("incompatible");
  expect(append).not.toHaveBeenCalled();
});

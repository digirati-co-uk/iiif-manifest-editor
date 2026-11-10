import { describe, it, expect } from "vitest";
import { registerRuntime } from "./runtime-api.mjs";

const createEditorI18n = () => {};
const host = {
  I18n: { EditorI18nProvider() {}, createEditorI18n },
  I18nCore: { createEditorI18n },
  React: { version: "19.2.8" },
  ReactDOM: {},
  ReactDOMClient: {},
  ReactDOMServer: {},
  jsxRuntime: {},
  ReactReconciler: () => {},
};

describe("browser runtime API", () => {
  it("passes the original host modules to the factory and returns its components", () => {
    const target = {};
    const runtime = { ManifestEditor() {}, Vault() {} };
    registerRuntime(target, "build-a", "2.2.1-test.0", (modules) => {
      expect(modules).toEqual({
        "@manifest-editor/i18n": host.I18n,
        "@manifest-editor/i18n/core": host.I18nCore,
        react: host.React,
        "react-dom": host.ReactDOM,
        "react-dom/client": host.ReactDOMClient,
        "react-dom/server": host.ReactDOMServer,
        "react-dom/server.browser": host.ReactDOMServer,
        "react/jsx-runtime": host.jsxRuntime,
        "react-reconciler": host.ReactReconciler,
      });
      expect(modules.react).toBe(host.React);
      return runtime;
    });
    expect(target.ManifestEditor.runtimeApiVersion).toBe(2);
    expect(target.ManifestEditor.createRuntime(host)).toBe(runtime);
  });

  it("rejects incompatible React and missing renderer dependencies before initialising", () => {
    const target = {};
    registerRuntime(target, "build-a", "2.2.1-test.0", () => {
      throw new Error("Must not run");
    });
    expect(() => target.ManifestEditor.createRuntime({ ...host, React: { version: "18.3.1" } })).toThrow("React 19");
    expect(() => target.ManifestEditor.createRuntime({ ...host, I18n: undefined })).toThrow("requires I18n");
    expect(() => target.ManifestEditor.createRuntime({ ...host, I18nCore: undefined })).toThrow("requires I18nCore");
    expect(() => target.ManifestEditor.createRuntime({ ...host, I18n: {} })).toThrow("requires public I18n");
    expect(() => target.ManifestEditor.createRuntime({ ...host, I18nCore: { createEditorI18n() {} } })).toThrow(
      "same public runtime"
    );
    expect(() => target.ManifestEditor.createRuntime({ ...host, ReactReconciler: undefined })).toThrow(
      "requires ReactReconciler"
    );
  });

  it("keeps exact-build loading and captured APIs stable when another release loads", () => {
    const target = {};
    const first = () => "first";
    registerRuntime(target, "build-a", "2.2.1-test.0", first);
    const api = target.ManifestEditor;
    registerRuntime(target, "build-b", "2.2.1-test.1", () => "second");
    expect(api.createRuntime(host)).toBe("first");
    expect(target.ManifestEditor.createRuntime(host)).toBe("second");
    expect(target.ManifestEditor.version).toBe("2.2.1-test.1");
    expect(target.__manifestEditorFactories["build-a"]).toBe(first);
  });
});

describe("automatic runtime", () => {
  const modules = [
    host.I18n,
    host.React,
    host.ReactDOM,
    host.ReactDOMClient,
    host.ReactDOMServer,
    host.jsxRuntime,
    { default: host.ReactReconciler },
  ];

  it("loads pinned CDN dependencies once and exposes the React used by the editor", async () => {
    const target = {};
    const urls = [];
    const runtime = { ManifestEditor() {}, Vault() {} };
    let factories = 0;
    registerRuntime(
      target,
      "build-a",
      "2.2.1-test.0",
      (dependencies) => {
        factories++;
        expect(dependencies.react).toBe(host.React);
        expect(dependencies["react-reconciler"]).toBe(host.ReactReconciler);
        expect(dependencies["@manifest-editor/i18n/core"]).toBe(host.I18n);
        return runtime;
      },
      async (url) => {
        urls.push(url);
        return modules[urls.length - 1];
      }
    );
    const first = target.ManifestEditor.automaticRuntime();
    expect(target.ManifestEditor.automaticRuntime()).toBe(first);
    const result = await first;
    expect(result.ManifestEditor).toBe(runtime.ManifestEditor);
    expect(result.React).toBe(host.React);
    expect(result.ReactDOMClient).toBe(host.ReactDOMClient);
    expect(urls).toHaveLength(7);
    expect(urls.some((url) => url.includes("/core?"))).toBe(false);
    expect(urls.every((url) => url.startsWith("https://esm.sh/") && url.includes("target=es2022"))).toBe(true);
    expect(
      urls
        .filter((url) => url.includes("react-dom") || url.includes("react-reconciler"))
        .every((url) => url.includes("deps=react@19.2.8"))
    ).toBe(true);
    await target.ManifestEditor.automaticRuntime();
    expect(factories).toBe(1);
  });

  it("allows retrying a failed dependency load", async () => {
    const target = {};
    let calls = 0;
    registerRuntime(
      target,
      "build-a",
      "2.2.1-test.0",
      () => ({}),
      async () => {
        const index = calls++;
        if (index === 0) throw new Error("Network unavailable");
        return modules[index % 7];
      }
    );
    await expect(target.ManifestEditor.automaticRuntime()).rejects.toThrow("Network unavailable");
    await expect(target.ManifestEditor.automaticRuntime()).resolves.toHaveProperty("React", host.React);
    expect(calls).toBe(14);
  });

  it("uses the dependency versions captured by the browser build", async () => {
    const target = {};
    const urls = [];
    registerRuntime(
      target,
      "build-a",
      "3.0.0",
      () => ({}),
      async (url) => {
        urls.push(url);
        return modules[urls.length - 1];
      },
      { i18n: "3.0.1", react: "19.3.0", reconciler: "0.34.0" }
    );
    await target.ManifestEditor.automaticRuntime();
    expect(urls[0]).toBe("https://esm.sh/@manifest-editor/i18n@3.0.1?deps=react@19.3.0&target=es2022");
    expect(urls[6]).toContain("react-reconciler@0.34.0?deps=react@19.3.0");
  });
});

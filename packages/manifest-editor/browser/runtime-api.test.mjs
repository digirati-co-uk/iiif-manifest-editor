import { describe, it, expect } from "vitest";
import { registerRuntime } from "./runtime-api.mjs";

const host = {
  I18n: { EditorI18nProvider() {} },
  I18nCore: { createEditorI18n() {} },
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
    host.I18nCore,
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
    expect(urls).toHaveLength(8);
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
        return modules[index % 8];
      }
    );
    await expect(target.ManifestEditor.automaticRuntime()).rejects.toThrow("Network unavailable");
    await expect(target.ManifestEditor.automaticRuntime()).resolves.toHaveProperty("React", host.React);
    expect(calls).toBe(16);
  });
});

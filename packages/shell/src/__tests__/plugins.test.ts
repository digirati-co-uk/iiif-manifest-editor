import { describe, expect, test, vi } from "vitest";
import type { MappedApp } from "../AppContext/AppContext";
import { mergePartialConfig } from "../ConfigContext/ConfigContext";
import {
  applyPlugins,
  createPluginRuntimeApi,
  enablePluginAndDependenciesInConfig,
  getEnabledPluginsForApp,
  getEffectivePluginSettings,
  getPluginSettingsFromConfig,
  isPluginSelected,
  mapPlugin,
  resetPluginInConfig,
  resetPluginSettingsInConfig,
  setPluginSettingsInConfig,
} from "../PluginContext/PluginContext.helpers";
import { createPluginStore } from "../PluginContext/PluginContext.store";
import type { MappedPlugin, PluginModule, PluginStoreSnapshot } from "../PluginContext/PluginContext.types";

const panel = (id: string) =>
  ({
    id,
    label: id,
    render: () => null,
  }) as any;

const baseApp = (overrides: Partial<MappedApp> = {}): MappedApp => ({
  metadata: {
    id: "manifest-editor",
    title: "Manifest Editor",
    projectType: "Manifest",
  },
  layout: {
    leftPanels: [panel("base-left")],
    centerPanels: [panel("base-center")],
    rightPanels: [],
  },
  config: {
    editorFeatureFlags: {
      annotationPopups: false,
    },
    editorConfig: {
      Canvas: {
        fields: ["label"],
      },
    },
  },
  ...overrides,
});

const plugin = (id: string, extension: Partial<PluginModule> = {}): MappedPlugin =>
  mapPlugin({
    default: {
      id,
      label: id,
    },
    ...extension,
  } as PluginModule);

describe("plugin mapping", () => {
  test("maps preset-shaped plugin modules into metadata and extension", () => {
    const mapped = mapPlugin({
      default: {
        id: "@example/ocr",
        label: "OCR",
        official: true,
      },
      leftPanels: [panel("ocr-panel")],
      config: {
        editorFeatureFlags: {
          annotationPopups: true,
        },
      },
      settings: {
        defaults: {
          mode: "default",
        },
      },
    });

    expect(mapped.metadata.id).toBe("@example/ocr");
    expect(mapped.extension.leftPanels?.[0]?.id).toBe("ocr-panel");
    expect(mapped.extension.config?.editorFeatureFlags?.annotationPopups).toBe(true);
    expect(mapped.settings?.defaults).toEqual({ mode: "default" });
  });
});

describe("plugin application", () => {
  test("applies compatible plugins and skips duplicate contribution ids", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const app = applyPlugins(baseApp(), [
      plugin("@example/ocr", {
        leftPanels: [panel("base-left"), panel("ocr-panel")],
        config: {
          editorConfig: {
            Canvas: {
              hideTabs: ["technical"],
            },
          },
        },
      }),
    ]);

    expect(app.layout.leftPanels.map((item) => item.id)).toEqual(["base-left", "ocr-panel"]);
    expect(app.config?.editorConfig?.Canvas).toEqual({
      fields: ["label"],
      hideTabs: ["technical"],
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('contribution "base-left"'),
    );
    warn.mockRestore();
  });

  test("filters by app and project type support", () => {
    const manifestPlugin = plugin("@example/manifest", {
      default: {
        id: "@example/manifest",
        label: "Manifest only",
        supports: {
          apps: ["manifest-editor"],
          projectTypes: ["Manifest"],
        },
      },
      leftPanels: [panel("manifest-panel")],
    } as any);

    const collectionPlugin = plugin("@example/collection", {
      default: {
        id: "@example/collection",
        label: "Collection only",
        supports: {
          projectTypes: ["Collection"],
        },
      },
      leftPanels: [panel("collection-panel")],
    } as any);

    const app = applyPlugins(baseApp(), [manifestPlugin, collectionPlugin], "manifest-editor");

    expect(app.layout.leftPanels.map((item) => item.id)).toEqual(["base-left", "manifest-panel"]);
  });

  test("applies selected dependencies before dependents regardless of provider order", () => {
    const base = plugin("@example/base");
    const dependent = plugin("@example/dependent", {
      default: {
        id: "@example/dependent",
        label: "Dependent",
        dependencies: ["@example/base"],
      },
    } as any);
    const state: PluginStoreSnapshot = {
      plugins: [dependent, base],
      enabled: ["@example/base", "@example/dependent"],
      disabled: [],
      globalApps: {},
      apps: {},
    };

    expect(getEnabledPluginsForApp(state, baseApp(), "manifest-editor").map((item) => item.metadata.id)).toEqual([
      "@example/base",
      "@example/dependent",
    ]);
  });
});

describe("plugin store", () => {
  test("isolates enabled and disabled state by app id", () => {
    const store = createPluginStore({
      plugins: [plugin("@example/ocr")],
      enabled: ["@example/default"],
    });

    store.getState().enable("manifest-editor", "@example/ocr");
    store.getState().disable("collection-editor", "@example/ocr");

    expect(store.getState().enabled).toEqual(["@example/default"]);
    expect(store.getState().apps["manifest-editor"]).toEqual({
      enabled: ["@example/ocr"],
      disabled: [],
    });
    expect(store.getState().apps["collection-editor"]).toEqual({
      enabled: [],
      disabled: ["@example/ocr"],
    });
  });

  test("replaces workspace app config without changing provider defaults", () => {
    const store = createPluginStore({
      enabled: ["@example/default"],
    });

    store.getState().setAppConfig("manifest-editor", {
      enabled: ["@example/workspace"],
      disabled: ["@example/default"],
    });

    expect(store.getState().enabled).toEqual(["@example/default"]);
    expect(store.getState().apps["manifest-editor"]).toEqual({
      enabled: ["@example/workspace"],
      disabled: ["@example/default"],
    });
  });

  test("uses workspace config over global config over provider defaults", () => {
    const enabledByDefault = plugin("@example/default", {
      default: {
        id: "@example/default",
        label: "Default",
        defaultEnabled: true,
      },
    } as any);
    const providerEnabled = plugin("@example/provider");
    const globalEnabled = plugin("@example/global");
    const workspaceEnabled = plugin("@example/workspace");
    const state: PluginStoreSnapshot = {
      plugins: [enabledByDefault, providerEnabled, globalEnabled, workspaceEnabled],
      enabled: ["@example/provider"],
      disabled: ["@example/global"],
      globalApps: {
        "manifest-editor": {
          enabled: ["@example/global"],
          disabled: ["@example/provider"],
        },
      },
      apps: {
        "manifest-editor": {
          enabled: ["@example/provider", "@example/workspace"],
          disabled: ["@example/default"],
        },
      },
    };

    expect(isPluginSelected(enabledByDefault, state, "manifest-editor")).toBe(false);
    expect(isPluginSelected(providerEnabled, state, "manifest-editor")).toBe(true);
    expect(isPluginSelected(globalEnabled, state, "manifest-editor")).toBe(true);
    expect(isPluginSelected(workspaceEnabled, state, "manifest-editor")).toBe(true);
  });

  test("can enable compatible dependencies into the same scoped config", () => {
    const base = plugin("@example/base");
    const dependent = plugin("@example/dependent", {
      default: {
        id: "@example/dependent",
        label: "Dependent",
        dependencies: ["@example/base"],
      },
    } as any);
    const state: PluginStoreSnapshot = {
      plugins: [dependent, base],
      enabled: [],
      disabled: [],
      globalApps: {},
      apps: {},
    };

    const next = enablePluginAndDependenciesInConfig({}, state, dependent, baseApp(), "manifest-editor");

    expect(next.blocked).toEqual([]);
    expect(next.config.enabled).toEqual(["@example/base", "@example/dependent"]);
  });
});

describe("config merge", () => {
  test("merges nested editor, feature flag, and plugin config", () => {
    const merged = mergePartialConfig(
      {
        editorConfig: {
          Canvas: {
            fields: ["label"],
          },
        },
        editorFeatureFlags: {
          annotationPopups: false,
        },
        plugins: {
          apps: {
            "manifest-editor": {
              enabled: ["@example/a"],
              settings: {
                legacyMode: "base",
                "@example/a": {
                  mode: "base",
                },
              },
            },
          },
        },
      },
      {
        editorConfig: {
          Canvas: {
            hideTabs: ["technical"],
          },
        },
        editorFeatureFlags: {
          manifestGridOptions: true,
        },
        plugins: {
          apps: {
            "manifest-editor": {
              disabled: ["@example/b"],
              settings: {
                "@example/a": {
                  level: "workspace",
                },
                "@example/b": {
                  enabled: true,
                },
              },
            },
          },
        },
      },
    );

    expect(merged.editorConfig?.Canvas).toEqual({
      fields: ["label"],
      hideTabs: ["technical"],
    });
    expect(merged.editorFeatureFlags).toEqual({
      annotationPopups: false,
      manifestGridOptions: true,
    });
    expect(merged.plugins?.apps?.["manifest-editor"]).toEqual({
      enabled: ["@example/a"],
      disabled: ["@example/b"],
      settings: {
        legacyMode: "base",
        "@example/a": {
          level: "workspace",
        },
        "@example/b": {
          enabled: true,
        },
      },
    });
  });

  test("reads, writes, and resets plugin-keyed settings while preserving legacy keys", () => {
    const config = {
      settings: {
        legacyMode: "keep",
        "@example/a": {
          mode: "workspace",
        },
      },
    };
    const withSettings = setPluginSettingsInConfig(config, "@example/a", { mode: "updated" });
    const reset = resetPluginSettingsInConfig(withSettings, "@example/a");

    expect(getPluginSettingsFromConfig(withSettings, "@example/a")).toEqual({ mode: "updated" });
    expect(reset.settings).toEqual({ legacyMode: "keep" });
  });

  test("merges plugin defaults, global settings, and workspace settings", () => {
    const configurable = plugin("@example/configurable", {
      settings: {
        defaults: {
          mode: "default",
          retries: 1,
        },
      },
    });
    const state: PluginStoreSnapshot = {
      plugins: [configurable],
      enabled: [],
      disabled: [],
      globalApps: {
        "manifest-editor": {
          settings: {
            "@example/configurable": {
              mode: "global",
            },
          },
        },
      },
      apps: {
        "manifest-editor": {
          settings: {
            "@example/configurable": {
              retries: 3,
            },
          },
        },
      },
    };

    expect(getEffectivePluginSettings(state, "@example/configurable", "manifest-editor")).toEqual({
      mode: "global",
      retries: 3,
    });
    expect(createPluginRuntimeApi(state, "manifest-editor").getSettings("@example/configurable")).toEqual({
      mode: "global",
      retries: 3,
    });
  });

  test("resets workspace selection override without changing global selection", () => {
    const reset = resetPluginInConfig(
      {
        enabled: ["@example/a"],
        disabled: ["@example/b"],
      },
      "@example/a",
    );

    expect(reset).toEqual({
      enabled: [],
      disabled: ["@example/b"],
    });
  });
});

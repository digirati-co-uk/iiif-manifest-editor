import { describe, expect, test, vi } from "vitest";
import type { MappedApp } from "../AppContext/AppContext";
import { mergePartialConfig } from "../ConfigContext/ConfigContext";
import {
  applyPlugins,
  getEnabledPluginsForApp,
  mapPlugin,
} from "../PluginContext/PluginContext.helpers";
import { createPluginStore } from "../PluginContext/PluginContext.store";
import type { MappedPlugin, PluginModule } from "../PluginContext/PluginContext.types";

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
    });

    expect(mapped.metadata.id).toBe("@example/ocr");
    expect(mapped.extension.leftPanels?.[0]?.id).toBe("ocr-panel");
    expect(mapped.extension.config?.editorFeatureFlags?.annotationPopups).toBe(true);
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

  test("requires dependencies to be active earlier in plugin order", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const base = plugin("@example/base");
    const dependent = plugin("@example/dependent", {
      default: {
        id: "@example/dependent",
        label: "Dependent",
        dependencies: ["@example/base"],
      },
    } as any);
    const state = {
      plugins: [dependent, base],
      enabled: ["@example/base", "@example/dependent"],
      disabled: [],
      apps: {},
    };

    expect(getEnabledPluginsForApp(state, baseApp(), "manifest-editor").map((item) => item.metadata.id)).toEqual([
      "@example/base",
    ]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("dependencies are missing"));
    warn.mockRestore();
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
                mode: "base",
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
                level: "workspace",
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
        mode: "base",
        level: "workspace",
      },
    });
  });
});

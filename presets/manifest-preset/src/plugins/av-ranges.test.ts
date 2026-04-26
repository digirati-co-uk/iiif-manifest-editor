import { describe, expect, test } from "vitest";
import {
  getEnabledPluginsForApp,
  mapPlugin,
  type MappedApp,
  type PluginStoreSnapshot,
} from "@manifest-editor/shell";
import * as manifestPreset from "../index";
import pluginMetadata, {
  centerPanels,
  creators,
  leftPanels,
} from "./av-ranges";

function createVault(resources: Record<string, any>) {
  return {
    get(ref: any) {
      const id = typeof ref === "string" ? ref : ref?.id;
      return resources[id] || ref;
    },
  };
}

const manifestApp: MappedApp = {
  metadata: {
    id: "manifest-editor",
    title: "Manifest Editor",
    projectType: "Manifest",
  },
  layout: {
    leftPanels: [],
    centerPanels: [],
    rightPanels: [],
  },
};

const collectionApp: MappedApp = {
  metadata: {
    id: "collection-editor",
    title: "Collection Editor",
    projectType: "Collection",
  },
  layout: {
    leftPanels: [],
    centerPanels: [],
    rightPanels: [],
  },
};

describe("A/V ranges plugin", () => {
  test("is default-enabled for manifest apps", () => {
    const mapped = mapPlugin({
      default: pluginMetadata,
      leftPanels,
      centerPanels,
      creators,
    });
    const state: PluginStoreSnapshot = {
      plugins: [mapped],
      enabled: [],
      disabled: [],
      globalApps: {},
      apps: {},
    };

    expect(
      getEnabledPluginsForApp(state, manifestApp, "manifest-editor"),
    ).toEqual([mapped]);
    expect(
      getEnabledPluginsForApp(state, collectionApp, "collection-editor"),
    ).toEqual([]);
  });

  test("contributes A/V panels and creator through the plugin, not direct preset arrays", () => {
    expect(leftPanels.map((panel) => panel.id)).toEqual([
      "@manifest-editor/av-ranges-listing",
    ]);
    expect(centerPanels.map((panel) => panel.id)).toEqual([
      "av-ranges-workbench",
    ]);
    expect(creators.map((creator) => creator.id)).toEqual([
      "@manifest-editor/av-temporal-range",
    ]);

    expect(
      manifestPreset.leftPanels.some(
        (panel) => panel.id === "@manifest-editor/av-ranges-listing",
      ),
    ).toBe(false);
    expect(
      manifestPreset.centerPanels.some(
        (panel) => panel.id === "av-ranges-workbench",
      ),
    ).toBe(false);
    expect(
      manifestPreset.creators.some(
        (creator: any) => creator.id === "@manifest-editor/av-temporal-range",
      ),
    ).toBe(false);
  });

  test("hides the sidebar when the manifest has no direct A/V canvas", () => {
    const vault = createVault({
      "https://example.org/manifest": {
        id: "https://example.org/manifest",
        type: "Manifest",
        items: [{ id: "https://example.org/canvas/1", type: "Canvas" }],
      },
      "https://example.org/canvas/1": {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        duration: 10,
        items: [],
      },
    });

    expect(
      leftPanels[0]!.supports!({
        rootResource: { id: "https://example.org/manifest", type: "Manifest" },
        vault: vault as any,
        app: manifestApp,
        layoutState: {} as any,
        appState: {} as any,
      }),
    ).toBe(false);
  });

  test("shows the sidebar when the manifest has a direct Sound painting body with duration", () => {
    const vault = createVault({
      "https://example.org/manifest": {
        id: "https://example.org/manifest",
        type: "Manifest",
        items: [{ id: "https://example.org/canvas/1", type: "Canvas" }],
      },
      "https://example.org/canvas/1": {
        id: "https://example.org/canvas/1",
        type: "Canvas",
        duration: 10,
        items: [{ id: "https://example.org/page/1", type: "AnnotationPage" }],
      },
      "https://example.org/page/1": {
        id: "https://example.org/page/1",
        type: "AnnotationPage",
        items: [{ id: "https://example.org/annotation/1", type: "Annotation" }],
      },
      "https://example.org/annotation/1": {
        id: "https://example.org/annotation/1",
        type: "Annotation",
        motivation: "painting",
        body: {
          id: "https://example.org/audio.mp3",
          type: "Sound",
          format: "audio/mpeg",
        },
      },
    });

    expect(
      leftPanels[0]!.supports!({
        rootResource: { id: "https://example.org/manifest", type: "Manifest" },
        vault: vault as any,
        app: manifestApp,
        layoutState: {} as any,
        appState: {} as any,
      }),
    ).toBe(true);
  });
});

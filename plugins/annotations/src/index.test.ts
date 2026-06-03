import {
  applyPlugins,
  getEnabledPluginsForApp,
  mapPlugin,
  type MappedApp,
  type PluginStoreSnapshot,
} from "@manifest-editor/shell";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { ANNOTATIONS_LEFT_PANEL_ID, BULK_ANNOTATION_IMPORT_ACTION_ID } from "./constants";

vi.mock("@manifest-editor/components", () => ({
  ActionButton: ({ children }: any) => children,
  AddIcon: () => null,
  CheckIcon: () => null,
  DeleteIcon: () => null,
  EditTextIcon: () => null,
  HTMLAnnotationBodyRender: () => null,
  Modal: ({ children }: any) => children,
  Sidebar: ({ children }: any) => children,
  SidebarContent: ({ children }: any) => children,
  SidebarHeader: () => null,
  TargetIcon: () => null,
}));

vi.mock("@manifest-editor/editors", () => ({
  AnnotationCreationPopup: () => null,
  AnnotationPreview: () => null,
  CanvasTargetContext: ({ children }: any) => children,
  HTMLAnnotationEditor: () => null,
  ViewerAnnotationPage: () => null,
  useAnnotationEditor: () => ({
    isPending: false,
    cancelRequest: vi.fn(),
    busy: false,
    requestAnnotationFromTarget: vi.fn(async () => undefined),
    deleteAnnotation: vi.fn(),
  }),
  useAnnotationInfo: () => [null, { highlightProps: {}, annotationTarget: null }],
  useInStack: () => null,
}));

vi.mock("react-iiif-vault", () => ({
  AnnotationContext: ({ children }: any) => children,
  AnnotationPageContext: ({ children }: any) => children,
  CanvasContext: ({ children }: any) => children,
  LocaleString: ({ children }: any) => children,
  useAnnotation: () => null,
  useAnnotationPage: () => null,
  useAtlasStore: () => ({}),
  useCanvas: () => null,
  useManifest: () => null,
  useRenderingStrategy: () => [{ type: "images" }],
  useRequestAnnotation: () => ({
    requestAnnotation: vi.fn(),
    isActive: false,
    busy: false,
    cancelRequest: vi.fn(),
  }),
}));

vi.mock("zustand", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zustand")>();
  return {
    ...actual,
    useStore: () => false,
  };
});

const panel = (id: string) =>
  ({
    id,
    label: id,
    render: () => null,
  }) as any;

const baseApp: MappedApp = {
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
};

describe("annotations plugin application", () => {
  let annotationsPlugin: any;

  beforeAll(async () => {
    annotationsPlugin = await import("./index");
  });

  test("is default enabled and contributes annotation UI plus importer action", () => {
    const mapped = mapPlugin(annotationsPlugin as any);
    const state: PluginStoreSnapshot = {
      plugins: [mapped],
      enabled: [],
      disabled: [],
      globalApps: {},
      apps: {},
    };
    const enabled = getEnabledPluginsForApp(state, baseApp, "manifest-editor");
    const app = applyPlugins(baseApp, enabled, "manifest-editor");

    expect(enabled.map((plugin) => plugin.metadata.id)).toEqual(["@manifest-editor/annotations"]);
    expect(app.layout.leftPanels.map((item) => item.id)).toContain(ANNOTATIONS_LEFT_PANEL_ID);
    expect(app.layout.backgroundActions?.map((item) => item.id)).toContain(BULK_ANNOTATION_IMPORT_ACTION_ID);
  });

  test("can be disabled by workspace plugin config", () => {
    const mapped = mapPlugin(annotationsPlugin as any);
    const state: PluginStoreSnapshot = {
      plugins: [mapped],
      enabled: [],
      disabled: [],
      globalApps: {},
      apps: {
        "manifest-editor": {
          disabled: ["@manifest-editor/annotations"],
        },
      },
    };
    const enabled = getEnabledPluginsForApp(state, baseApp, "manifest-editor");
    const app = applyPlugins(baseApp, enabled, "manifest-editor");

    expect(enabled).toEqual([]);
    expect(app.layout.leftPanels.map((item) => item.id)).not.toContain(ANNOTATIONS_LEFT_PANEL_ID);
    expect(app.layout.backgroundActions?.map((item) => item.id) || []).not.toContain(BULK_ANNOTATION_IMPORT_ACTION_ID);
  });
});

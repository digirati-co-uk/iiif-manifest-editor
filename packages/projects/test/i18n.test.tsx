import { ThemeProvider } from "styled-components";
import { Vault } from "@iiif/helpers/vault";
import { ProjectProvider } from "../src/ProjectContext.internal";
import { useProjectContext, useProjectLoading } from "../src/ProjectContext";
import { LocalStorageLoader } from "../src/storage/LocalStorageLoader";
import { WebsocketLoader } from "../src/storage/WebsocketLoader";
import { act, type ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createEditorI18n, createMessageReference, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { DraftTitleEditor } from "../src/components/DraftTitleEditor";
import { AppMenu } from "../src/components/AppMenu";
import { ProjectReactContext } from "../src/ProjectContext";
import type { ProjectContext } from "../src/ProjectContext.types";
import { projectFromManifest } from "../src/helpers/project-from-manifest";
import { projectFromCollection } from "../src/helpers/project-from-collection";
import { ensureUniqueFilename } from "../src/helpers/ensure-unique-filename";
import { projectContextReducer } from "../src/ProjectContext.reducer";
import { LocalStorageBackend } from "../src/backend/LocalStorageBackend";

const { changeApp, apps } = vi.hoisted(() => ({ changeApp: vi.fn(), apps: {} as Record<string, any> }));
vi.mock("@manifest-editor/shell", () => ({
  useApps: () => ({ apps, changeApp, currentApp: { id: "splash" } }),
  AppResourceProvider: ({ children }: { children: ReactNode }) => children,
  AppResourceInstanceProvider: ({ children }: { children: ReactNode }) => children,
  useLocalStorage: () => {
    const [value, setValue] = useState(false);
    return [value, setValue];
  },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
  vi.clearAllMocks();
  for (const key of Object.keys(apps)) delete apps[key];
});
async function mount(element: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => root.render(<ThemeProvider theme={{ color: {}, padding: {} }}>{element}</ThemeProvider>));
  return container;
}
function runtime() {
  return createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
  });
}
function project(name = "Enw Cymraeg") {
  return projectFromManifest({
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { cy: [name] },
    items: [],
  });
}
function context(name?: string) {
  const current = project(name);
  if (name === "") current.name = "";
  return {
    current,
    allProjects: [current],
    loadingStatus: null,
    canDelete: true,
    actions: { updateDetails: vi.fn() },
  } as unknown as ProjectContext;
}
it("keeps the actual title input, typed text, focus and callback across locale/profile switches", async () => {
  const i18n = runtime();
  const ctx = context();
  const before = JSON.stringify(ctx.current);
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <ProjectReactContext.Provider value={ctx}>
        <DraftTitleEditor />
      </ProjectReactContext.Provider>
    </EditorI18nProvider>
  );
  const title = container.querySelector<HTMLElement>("button")!;
  expect(title.textContent).toBe("Enw Cymraeg");
  await act(async () => title.click());
  const input = container.querySelector("input")!;
  input.value = "Teitl newydd <literal>";
  expect(document.activeElement).toBe(input);
  await act(async () => {
    await i18n.setLocale("nl");
    await i18n.setProfile("plain");
  });
  expect(container.querySelector("input")).toBe(input);
  expect(document.activeElement).toBe(input);
  expect(input.value).toBe("Teitl newydd <literal>");
  expect(input.getAttribute("aria-label")).toBe("Concepttitel");
  expect(container.querySelector("button")?.textContent).toBe("Opslaan");
  expect(JSON.stringify(ctx.current)).toBe(before);
  const event = new Event("submit", { bubbles: true, cancelable: true });
  await act(async () => container.querySelector("form")!.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(ctx.actions.updateDetails).toHaveBeenCalledExactlyOnceWith({ name: "Teitl newydd <literal>" });
});
it("translates only the display fallback and never persists it", async () => {
  const i18n = runtime();
  const ctx = context("");
  const before = JSON.stringify(ctx.current);
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <ProjectReactContext.Provider value={ctx}>
        <DraftTitleEditor />
      </ProjectReactContext.Provider>
    </EditorI18nProvider>
  );
  expect(container.textContent).toContain("Untitled project");
  await act(async () => {
    await i18n.setLocale("nl");
  });
  expect(container.textContent).toContain("Project zonder titel");
  expect(JSON.stringify(ctx.current)).toBe(before);
  expect(ctx.actions.updateDetails).not.toHaveBeenCalled();
  await act(async () => container.querySelector<HTMLElement>("button")!.click());
  expect(container.querySelector("input")!.value).toBe("");
});
it("updates an open app menu, retains authored app names and resolves optional references at display time", async () => {
  const i18n = runtime();
  apps.custom = { metadata: { id: "custom-app-id", title: "Mijn collectie" } };
  apps.localized = {
    metadata: {
      id: "localized-app-id",
      title: "Legacy label",
      titleMessage: createMessageReference("projects", "menu.open"),
    },
  };
  apps.launcher = { metadata: { id: "launcher-id", title: "Launcher", type: "launcher" } };
  apps.wrongType = {
    metadata: { id: "collection-id", title: "Collection only", project: true, projectType: "Collection" },
  };
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <ProjectReactContext.Provider value={context()}>
        <AppMenu />
      </ProjectReactContext.Provider>
    </EditorI18nProvider>
  );
  const toggle = container.querySelector("button")!;
  expect(toggle.getAttribute("aria-label")).toBe("App menu");
  await act(async () => toggle.click());
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  await act(async () => {
    await i18n.setLocale("nl");
  });
  expect(container.querySelector("button")).toBe(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(container.textContent).toContain("Toepassingen");
  expect(container.textContent).toContain("Snelle instellingen");
  expect(container.textContent).toContain("Mijn collectie");
  expect(container.textContent).toContain("Openen");
  expect(container.textContent).not.toContain("Collection only");
  expect(container.textContent).not.toContain("Launcher");
  const buttons = [...container.querySelectorAll("button")];
  await act(async () => buttons.find((b) => b.textContent === "Menu verbergen")!.click());
  expect(container.textContent).toContain("Menu tonen");
  await act(async () => buttons.find((b) => b.textContent === "Mijn collectie")!.click());
  expect(changeApp).toHaveBeenCalledExactlyOnceWith({ id: "custom-app-id" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
});
it("preserves legacy project creation defaults, deterministic filenames, authored IIIF and backend records", async () => {
  const i18n = runtime();
  const manifest = project();
  const collection = projectFromCollection({
    id: "https://example.org/collection",
    type: "Collection",
    label: { none: ["Eigen collectie"] },
    items: [],
  });
  const blankManifest = project("");
  const blankCollection = projectFromCollection({
    id: "https://example.org/empty",
    type: "Collection",
    items: [],
  } as any);
  expect(blankManifest.name).toBe("Untitled manifest");
  expect(blankCollection.name).toBe("Untitled collection");
  const duplicate = { ...manifest };
  ensureUniqueFilename(duplicate, [manifest]);
  expect(duplicate.filename).toBe("enw-cymraeg (1)");
  const before = JSON.stringify([manifest, collection, blankManifest, blankCollection, duplicate]);
  const records = new Map<string, unknown>();
  const backend = new LocalStorageBackend({ namespace: "unchanged-schema" });
  backend.storage = {
    getItem: async (key: string) => records.get(key) ?? null,
    setItem: async (key: string, value: unknown) => {
      records.set(key, value);
      return value;
    },
    removeItem: async (key: string) => {
      records.delete(key);
    },
  } as LocalForage;
  await backend.createProject(manifest);
  await backend.setLastProject(manifest.id);
  const stored = records.get(`unchanged-schema/projects/${manifest.id}`);
  expect(stored).toBe(JSON.stringify(manifest));
  await i18n.setLocale("nl");
  await i18n.setProfile("plain");
  expect(JSON.stringify([manifest, collection, blankManifest, blankCollection, duplicate])).toBe(before);
  expect(await backend.getAllProjects()).toEqual([manifest]);
  expect(await backend.getLastProject()).toBe(manifest.id);
  expect(records.get(`unchanged-schema/projects/${manifest.id}`)).toBe(stored);
  const loaded = projectContextReducer(
    { current: null, allProjects: [], loadingStatus: null },
    {
      type: "load",
      payload: {
        current: manifest,
        allProjects: [manifest],
        loadingStatus: { loading: false, loaded: true, lastLoaded: 1234 },
      },
    }
  );
  expect(loaded.current).toEqual(manifest);
  expect(loaded.loadingStatus?.lastLoaded).toBe(1234);
});

it("translates pending project loading without recreating the loader or losing its eventual result", async () => {
  const i18n = runtime();
  const current = project();
  const vault = new Vault();
  let finishProjects!: (value: (typeof current)[]) => void;
  let finishVault!: () => void;
  const projectsReady = new Promise<(typeof current)[]>((resolve) => {
    finishProjects = resolve;
  });
  const vaultReady = new Promise<void>((resolve) => {
    finishVault = resolve;
  });
  const backend = new LocalStorageBackend();
  backend.getAllProjects = vi.fn(() => projectsReady);
  backend.getLastProject = vi.fn(async () => current.id);
  const storage = new LocalStorageLoader();
  storage.createVaultInstance = vi.fn((): [Vault, Promise<void>] => [vault, vaultReady]);
  storage.closeVaultInstance = vi.fn();
  storage.saveStorage = vi.fn(async () => {});
  function Result() {
    const { current } = useProjectContext();
    const { isLoading } = useProjectLoading();
    return <output data-loading={isLoading}>{current?.name}</output>;
  }
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <ProjectProvider
        backend={backend}
        storage={storage}
        initialState={() => ({
          current,
          allProjects: [current],
          loadingStatus: { loading: true, loaded: false, lastLoaded: 0 },
        })}
      >
        <Result />
      </ProjectProvider>
    </EditorI18nProvider>
  );
  const status = container.querySelector("output");
  expect(status?.textContent).toBe("Loading...");
  await act(async () => {
    await i18n.setLocale("nl");
    await i18n.setProfile("plain");
  });
  expect(container.querySelector("output")).toBe(status);
  expect(status?.textContent).toBe("Laden...");
  expect(storage.createVaultInstance).toHaveBeenCalledTimes(1);
  expect(storage.closeVaultInstance).not.toHaveBeenCalled();
  expect(backend.getAllProjects).toHaveBeenCalledTimes(1);
  await act(async () => {
    finishProjects([current]);
    finishVault();
  });
  expect(container.querySelector("output")?.textContent).toBe("Enw Cymraeg");
  expect(container.querySelector("output")?.getAttribute("data-loading")).toBe("false");
  expect(storage.createVaultInstance).toHaveBeenCalledTimes(1);
});
it("round-trips original resource storage and keeps server capabilities and diagnostics unchanged", async () => {
  const i18n = runtime();
  const current = project();
  const original = current.storage.data;
  const storage = new LocalStorageLoader({ namespace: "schema-test" });
  const ref = await storage.create(current, original as any);
  const before = localStorage.getItem(`schema-test/store/${ref.data.key}`);
  await i18n.setLocale("nl");
  expect((await storage.getStorage(ref))?.data).toEqual(original);
  expect(localStorage.getItem(`schema-test/store/${ref.data.key}`)).toBe(before);
  const server = new WebsocketLoader({ baseUrl: "https://example.org", token: "test-token" });
  expect(server.canCreate()).toBe(false);
  expect(server.canDelete()).toBe(false);
  await expect(server.create(current, original as any)).rejects.toThrow(
    "Cannot create new project from Manifest Editor"
  );
  await expect(server.deleteStorage(ref as any)).rejects.toThrow("Cannot delete");
});

it("supports English without an i18n provider and keeps two title editors independently focused", async () => {
  const first = context("First authored name");
  const second = context("Second authored name");
  const container = await mount(
    <>
      <ProjectReactContext.Provider value={first}>
        <DraftTitleEditor />
      </ProjectReactContext.Provider>
      <ProjectReactContext.Provider value={second}>
        <DraftTitleEditor />
      </ProjectReactContext.Provider>
    </>
  );
  const buttons = [...container.querySelectorAll("button")];
  expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
    "Edit project title: First authored name",
    "Edit project title: Second authored name",
  ]);
  await act(async () => buttons[0]!.click());
  const firstInput = container.querySelector("input")!;
  firstInput.value = "Unsaved first name";
  await act(async () => buttons[1]!.click());
  const inputs = container.querySelectorAll("input");
  expect(document.activeElement).toBe(inputs[1]);
  expect(inputs[0]).toBe(firstInput);
  expect(firstInput.value).toBe("Unsaved first name");
  expect(first.actions.updateDetails).not.toHaveBeenCalled();
  expect(second.actions.updateDetails).not.toHaveBeenCalled();
});

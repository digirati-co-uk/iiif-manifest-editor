import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, test, vi } from "vitest";
import { Vault } from "@iiif/helpers";
import type { Manifest, Collection } from "@iiif/presentation-3";
import { useVault, useResourceContext } from "react-iiif-vault";
import {
  EditorI18nProvider,
  useEditorI18n,
  useOptionalEditorI18nInstance,
  useTranslations,
} from "@manifest-editor/i18n";
import { createEditorI18n, createCatalogContract, type EditorI18n } from "@manifest-editor/i18n/core";
import { useConfig, useEditingResource, useEditingStack, useManifestEditor } from "@manifest-editor/shell";
import { ManifestEditor, type ManifestEditorProps } from "./ManifestEditor";
import { webUiResources } from "../../../apps/web/src/i18n/resources";
import { createWebUiPolicy } from "../../../apps/web/src/i18n/policy";
import { WebI18nProvider } from "../../../apps/web/src/i18n/WebI18nProvider";

// Only preset layouts/plugins and the heavy native renderer are replaced. The facade,
// Shell/App/Plugin/Vault providers, editing stack and public runtime are real. Undo here is a mounted form history,
// not a native rich-text renderer history.
vi.mock("@manifest-editor/manifest-preset", () => ({
  default: { id: "test-manifest", title: "Test manifest" },
  config: { notebook: { enabled: false } },
  plugins: [],
  preset: { localisation: { policies: [{ availableProfiles: ["standard", "plain"] }] } },
}));
vi.mock("@manifest-editor/collection-preset", () => ({
  collectionPreset: { metadata: { id: "test-collection", title: "Test collection" }, layout: {} },
}));
vi.mock("@manifest-editor/shell", async (original) => ({
  ...(await original<typeof import("@manifest-editor/shell")>()),
  Layout: () => <TestLayout />,
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.replaceChildren();
  localStorage.clear();
});
const data: Manifest = {
  id: "https://example.org/manifest",
  type: "Manifest",
  label: { cy: ["Teitl Cymraeg"] },
  items: [],
};
let api!: ReturnType<typeof useEditorI18n>;
let instance!: EditorI18n | undefined;
let editor!: ReturnType<typeof useManifestEditor>;
let stack!: ReturnType<typeof useEditingStack>;
let selected!: ReturnType<typeof useEditingResource>;
let currentVault!: Vault;
let config!: ReturnType<typeof useConfig>;
let mounts = 0;
let editDraft!: () => void;
let undoDraft!: () => void;
function TestLayout() {
  const context = useResourceContext();
  return context.collection ? <CollectionProbe /> : <Probe />;
}
function CollectionProbe() {
  api = useEditorI18n();
  instance = useOptionalEditorI18nInstance();
  const [draft] = useState("Collection draft");
  return <input value={draft} readOnly />;
}
function Probe() {
  api = useEditorI18n();
  instance = useOptionalEditorI18nInstance();
  editor = useManifestEditor();
  stack = useEditingStack();
  selected = useEditingResource();
  currentVault = useVault();
  config = useConfig();
  const t = useTranslations("editor-api");
  const [history, setHistory] = useState(() => {
    mounts++;
    return ["Teitl Cymraeg"];
  });
  editDraft = () => setHistory((values) => [...values, "Testun heb ei gadw"]);
  undoDraft = () => setHistory((values) => values.slice(0, -1));
  const draft = history.at(-1);
  return (
    <>
      <output>
        {api.locale}/{api.profile}/{t("fields.label")}
      </output>
      <input value={draft} readOnly />
    </>
  );
}
function mount() {
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  roots.push(root);
  return { root, node };
}

test("forwards resources through real Shell, updates locale/profile/config without remounting or changing authored content, Vault, editing selection or undo", async () => {
  mounts = 0;
  const vault = new Vault();
  const load = vi.spyOn(vault, "loadManifestSync");
  const { root, node } = mount();
  const render = (localisation: ManifestEditorProps["localisation"]) => (
    <ManifestEditor
      resource={data.id}
      data={data}
      vault={vault}
      localisation={localisation}
      config={{ i18n: { defaultLanguage: "cy", availableLanguages: ["cy"], advancedLanguageMode: true } }}
    />
  );
  await act(async () => root.render(render(webUiResources)));
  const input = node.querySelector("input");
  const initialEditor = editor;
  const initialInstance = instance;
  await act(async () =>
    stack.edit({ resource: { type: "SpecificResource", source: { id: data.id, type: "Manifest" } } })
  );
  const initialSelected = selected;
  await act(async () => editor.descriptive.label.set({ cy: ["New Welsh draft"] }));
  await act(async () => editDraft());
  await act(async () => api.select({ locale: "nl", profile: "plain" }));
  expect(node.querySelector("output")?.textContent).toBe("nl/plain/Titel");
  await act(async () =>
    root.render(render({ ...webUiResources, host: { nl: { "editor-api": { fields: { label: "Eigen titel" } } } } }))
  );
  expect(instance).not.toBe(initialInstance);
  expect(node.querySelector("output")?.textContent).toBe("nl/plain/Eigen titel");
  expect(editor).toBe(initialEditor);
  expect(currentVault).toBe(vault);
  expect(selected).toEqual(initialSelected);
  expect(node.querySelector("input")).toBe(input);
  expect(input?.value).toBe("Testun heb ei gadw");
  expect(mounts).toBe(1);
  expect(load).toHaveBeenCalledTimes(1);
  expect(config.i18n.defaultLanguage).toBe("cy");
  expect(vault.toPresentation3<Manifest>(data).label).toEqual({ cy: ["New Welsh draft"] });
  await act(async () => undoDraft());
  expect(input?.value).toBe("Teitl Cymraeg");
  expect(vault.toPresentation3<Manifest>(data).label).toEqual({ cy: ["New Welsh draft"] });
  expect(JSON.stringify(vault.toPresentation3(data))).not.toContain("Eigen titel");
});

test("inherits the actual controlled host, forwards override requests and retains authoritative rejection", async () => {
  let runtime = createEditorI18n(webUiResources);
  const onLocaleChange = vi.fn();
  const onProfileChange = vi.fn();
  const { root, node } = mount();
  const render = (locale: string, profile: string, override?: ManifestEditorProps["localisation"]) => (
    <EditorI18nProvider
      instance={runtime}
      locale={locale}
      profile={profile}
      onLocaleChange={onLocaleChange}
      onProfileChange={onProfileChange}
    >
      <ManifestEditor resource={data.id} data={data} localisation={override} />
    </EditorI18nProvider>
  );
  await act(async () => root.render(render("en-GB", "standard")));
  const input = node.querySelector("input");
  await act(async () => api.setLocale("nl"));
  expect(onLocaleChange).toHaveBeenCalledWith("nl");
  expect(api.locale).toBe("en-GB");
  await act(async () => root.render(render("nl", "plain", webUiResources)));
  expect(api.locale).toBe("nl");
  expect(api.profile).toBe("plain");
  expect(node.querySelector("input")).toBe(input);
  onProfileChange.mockRejectedValueOnce(new Error("Host refused"));
  await act(async () => {
    await expect(api.setProfile("standard")).rejects.toThrow("Host refused");
  });
  expect(api.profile).toBe("plain");
  const beforeReplacement = instance;
  runtime = createEditorI18n(webUiResources);
  await act(async () => root.render(render("en-GB", "standard", webUiResources)));
  expect(instance).not.toBe(beforeReplacement);
  expect(api.locale).toBe("en-GB");
  expect(api.profile).toBe("standard");
  expect(node.querySelector("input")).toBe(input);
});

test("NL-only web host keeps English fallback registered under a shell override without offering forbidden English", async () => {
  const { root, node } = mount();
  const policy = createWebUiPolicy({ availableLocales: ["nl"], availableProfiles: ["plain"] });
  await act(async () =>
    root.render(
      <WebI18nProvider policy={policy}>
        <ManifestEditor
          resource={data.id}
          data={data}
          localisation={webUiResources}
          config={{ uiI18n: { defaultProfile: "plain" } }}
        />
      </WebI18nProvider>
    )
  );
  expect(node.querySelector("output")?.textContent).toBe("nl/plain/Titel");
  expect(api.availableLocales.map((locale) => locale.id)).toEqual(["nl"]);
  expect(api.localeChain).toContain("en-GB");
  await act(async () => {
    await expect(api.setLocale("en-GB")).rejects.toThrow();
  });
});

test("two editor configurations remain isolated and an omitted prop preserves English defaults", async () => {
  const first = mount();
  const second = mount();
  await act(async () =>
    first.root.render(
      <ManifestEditor resource={data.id} data={data} localisation={{ ...webUiResources, locale: "nl" }} />
    )
  );
  const dutch = instance!;
  await act(async () => second.root.render(<ManifestEditor resource={data.id} data={data} />));
  const english = instance!;
  expect(first.node.querySelector("output")?.textContent).toBe("nl/standard/Label");
  expect(second.node.querySelector("output")?.textContent).toBe("en-GB/standard/Label");
  expect(dutch).not.toBe(english);
  await act(async () => dutch.setProfile("plain"));
  expect(first.node.querySelector("output")?.textContent).toBe("nl/plain/Titel");
  expect(second.node.querySelector("output")?.textContent).toBe("en-GB/standard/Label");
});

test("loads host-supplied namespace assets in the effective runtime and enforces preset restrictions", async () => {
  const source = { ready: "Ready" };
  const loadEnglish = vi.fn(async () => source);
  const loadDutch = vi.fn(async () => ({ ready: "Gereed" }));
  const localisation: ManifestEditorProps["localisation"] = {
    ...webUiResources,
    requiredNamespaces: ["host-fixture"],
    registrations: [
      {
        owner: "host-fixture",
        namespace: "host-fixture",
        sourceLocale: "en-GB",
        contract: createCatalogContract(source),
        loaders: { "en-GB": loadEnglish, nl: loadDutch },
      },
    ],
    policies: [{ availableProfiles: ["plain"] }],
  };
  const { root, node } = mount();
  await act(async () => root.render(<ManifestEditor resource={data.id} data={data} localisation={localisation} />));
  expect(api.profile).toBe("plain");
  expect(api.availableProfiles).toEqual(["plain"]);
  expect(api.translate("host-fixture")("ready")).toBe("Ready");
  const input = node.querySelector("input");
  await act(async () => api.setLocale("nl"));
  expect(api.translate("host-fixture")("ready")).toBe("Gereed");
  expect(loadEnglish).toHaveBeenCalledTimes(1);
  expect(loadDutch).toHaveBeenCalledTimes(1);
  expect(node.querySelector("input")).toBe(input);
  await act(async () => {
    await expect(api.setProfile("standard")).rejects.toThrow();
  });
});

test("collection mounting inherits the exact actual provider when no preset/host override exists", async () => {
  const runtime = createEditorI18n(webUiResources);
  const collection: Collection = {
    id: "https://example.org/collection",
    type: "Collection",
    items: [],
    label: { cy: ["Casgliad"] },
  };
  const { root, node } = mount();
  const onLocaleChange = vi.fn();
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={runtime} locale="en-GB" onLocaleChange={onLocaleChange}>
        <ManifestEditor resource={{ id: collection.id, type: "Collection" }} data={collection} />
      </EditorI18nProvider>
    )
  );
  expect(instance).toBe(runtime);
  const input = node.querySelector("input");
  await act(async () => api.setLocale("nl"));
  expect(onLocaleChange).toHaveBeenCalledWith("nl");
  expect(api.locale).toBe("en-GB");
  expect(node.querySelector("input")).toBe(input);
});

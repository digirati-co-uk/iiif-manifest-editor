import { PluginManager } from "../PluginContext/PluginManager";
import { normalisePlugin } from "../PluginContext/PluginContext.helpers";
import { LayoutActionsReactContext } from "../Layout/Layout.context";
import { useBackgroundActionFormatter } from "../BackgroundTasks/BackgroundActions";
import { act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, test, vi } from "vitest";
import { Vault } from "@iiif/helpers/vault";
import { VaultProvider } from "react-iiif-vault";
import {
  EditorI18nProvider,
  useEditorI18n,
  useOptionalEditorI18nInstance,
  useTranslations,
} from "@manifest-editor/i18n";
import {
  createEditorI18n,
  createCatalogContract,
  defaultLocales,
  dutchLocale,
  type EditorI18n,
} from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import {
  ConfigProvider,
  mergeConfig,
  mergePartialConfig,
  useConfig,
  useSaveConfig,
} from "../ConfigContext/ConfigContext";
import { AppReactContext, PrimeAppReactContext } from "../AppContext/AppContext";
import { EditingStack, useEditingStack, useEditingResource } from "../EditingStack/EditingStack";
import { PluginProvider, PluginI18nBridge, usePluginStoreApi } from "../PluginContext/PluginContext";
import { ShellI18nBoundary } from "./ShellI18n";
import { mergeLocalisation, validateShellUiI18n } from "./types";
import {
  createBackgroundActionsStore,
  getBackgroundActionInstanceKey,
  runBackgroundAction,
} from "../BackgroundTasks/BackgroundTasksStore";
import { backgroundActionLabel, backgroundActionStatus } from "../BackgroundTasks/BackgroundActionMessages";
import { createManifestEditorCanvasProgressApi } from "../CanvasProgress";
import { evaluateSpecifications } from "../SpecificationContext/SpecificationContext.helpers";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
afterEach(async () => {
  await act(async () => {
    roots.splice(0).forEach((root) => root.unmount());
  });
  document.body.replaceChildren();
});
function mount() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  return { container, root };
}
const options = { locales: [...defaultLocales, dutchLocale], catalogs: dutchCatalogs, profiles: { plain: dutchPlain } };

test("config merge keeps content languages separate, replaces allow lists and unions namespaces; validates the persisted schema", () => {
  const merged = mergeConfig(
    {
      i18n: { defaultLanguage: "cy", availableLanguages: ["cy"], advancedLanguageMode: true },
      uiI18n: { defaultLocale: "nl", availableLocales: ["en-GB", "nl"], requiredNamespaces: ["shell"] },
    },
    { uiI18n: { availableLocales: ["nl"], defaultProfile: "plain", requiredNamespaces: ["plugin-test", "shell"] } }
  );
  expect(merged.i18n).toEqual({ defaultLanguage: "cy", availableLanguages: ["cy"], advancedLanguageMode: true });
  expect(merged.uiI18n).toMatchObject({
    defaultLocale: "nl",
    defaultProfile: "plain",
    availableLocales: ["nl"],
    requiredNamespaces: ["shell", "plugin-test"],
  });
  expect(JSON.parse(JSON.stringify(merged.uiI18n))).toEqual(merged.uiI18n);
  expect(() => validateShellUiI18n({ profile: "plain" })).toThrow("Unknown uiI18n field");
  expect(() => validateShellUiI18n({ availableLocales: [] })).toThrow();
  expect(mergePartialConfig({ uiI18n: { defaultLocale: "nl" } }, {}).uiI18n?.defaultLocale).toBe("nl");
});

test("inherited preset overlays compose in order and host wins, policies intersect", () => {
  const base = {
    presets: [{ "en-GB": { shell: { preview: { open: "Base" } } } }],
    policies: [{ availableLocales: ["en-GB", "nl"] }],
  };
  const extension = {
    presets: [{ "en-GB": { shell: { preview: { open: "Derived" } } } }],
    policies: [{ availableProfiles: ["standard", "plain"] }],
  };
  const merged = mergeLocalisation(base, extension);
  const runtime = createEditorI18n({
    ...options,
    ...merged,
    config: { defaultProfile: "plain" },
    host: { "en-GB": { shell: { preview: { open: "Host" } } } },
  });
  expect(runtime.translate("shell")("preview.open")).toBe("Host");
  expect(merged?.presets).toHaveLength(2);
  const profiled = createEditorI18n({
    ...options,
    ...merged,
    config: { defaultProfile: "plain" },
    profiles: { plain: { "en-GB": { shell: { preview: { open: "Plain" } } } } },
    presetProfiles: { plain: { "en-GB": { shell: { preview: { open: "Preset plain" } } } } },
  });
  expect(profiled.translate("shell")("preview.open")).toBe("Preset plain");
  expect(() =>
    createEditorI18n({ ...options, policies: [{ availableLocales: ["nl"] }, { availableLocales: ["en-GB"] }] })
  ).toThrow();
});

test("inherits the actual host instance and controlled callbacks without bypassing host control", async () => {
  const runtime = createEditorI18n(options),
    onLocaleChange = vi.fn(),
    onProfileChange = vi.fn();
  let api!: ReturnType<typeof useEditorI18n>, actual: EditorI18n | undefined;
  function Probe() {
    api = useEditorI18n();
    actual = useOptionalEditorI18nInstance();
    return (
      <span>
        {api.locale}/{api.profile}
      </span>
    );
  }
  const { root, container } = mount();
  const render = (locale: string, profile = "standard") => (
    <EditorI18nProvider
      instance={runtime}
      locale={locale}
      profile={profile}
      onLocaleChange={onLocaleChange}
      onProfileChange={onProfileChange}
    >
      <ConfigProvider>
        <ShellI18nBoundary>
          <Probe />
        </ShellI18nBoundary>
      </ConfigProvider>
    </EditorI18nProvider>
  );
  await act(async () => root.render(render("en-GB")));
  expect(actual).toBe(runtime);
  await act(async () => {
    await api.select({ locale: "nl", profile: "plain" });
  });
  expect(onLocaleChange).toHaveBeenCalledWith("nl");
  expect(onProfileChange).toHaveBeenCalledWith("plain");
  expect(container.textContent).toBe("en-GB/standard");
  await act(async () => root.render(render("nl", "plain")));
  expect(container.textContent).toBe("nl/plain");
});

test("override intersects host policy and still requests controlled host selection", async () => {
  const runtime = createEditorI18n(options),
    request = vi.fn();
  let api!: ReturnType<typeof useEditorI18n>;
  function Probe() {
    api = useEditorI18n();
    return <span>{api.locale}</span>;
  }
  const { root, container } = mount();
  const overriddenOptions = { ...options, locale: "nl", profile: "plain" };
  const config = { uiI18n: { availableLocales: ["en-GB", "nl"], availableProfiles: ["standard"] } };
  const render = (locale: string) => (
    <EditorI18nProvider instance={runtime} locale={locale} onLocaleChange={request}>
      <ConfigProvider config={config}>
        <ShellI18nBoundary localisation={overriddenOptions}>
          <Probe />
        </ShellI18nBoundary>
      </ConfigProvider>
    </EditorI18nProvider>
  );
  await act(async () => root.render(render("en-GB")));
  await act(async () => {
    await api.setLocale("nl");
  });
  expect(request).toHaveBeenCalledWith("nl");
  expect(container.textContent).toBe("en-GB");
  await expect(api.setProfile("plain")).rejects.toThrow("Unavailable shell profile");
  await act(async () => root.render(render("nl")));
  expect(container.textContent).toBe("nl");
  expect(api.availableProfiles).toEqual(["standard"]);
});

test("two owned editors isolate selection; config/resource replacement preserves actual vault, editing stack and form state", async () => {
  const vault = new Vault();
  const resource = { id: "https://example.org/m", type: "Manifest" as const };
  await vault.loadManifest(resource.id, { ...resource, label: { cy: ["Teitl"] }, items: [] });
  const before = JSON.stringify(vault.toPresentation3(resource));
  let mounts = 0,
    api!: ReturnType<typeof useEditorI18n>,
    other!: ReturnType<typeof useEditorI18n>,
    save!: ReturnType<typeof useSaveConfig>,
    edit!: ReturnType<typeof useEditingStack>;
  function Probe() {
    api = useEditorI18n();
    save = useSaveConfig();
    edit = useEditingStack();
    const current = useEditingResource(),
      t = useTranslations("shell"),
      [value, setValue] = useState("unsaved");
    useEffect(() => {
      mounts++;
    }, []);
    return (
      <>
        <input value={value} onChange={(e) => setValue(e.target.value)} />
        <span>
          {t("preview.open")}/{current?.resource.source.id}
        </span>
      </>
    );
  }
  function Other() {
    other = useEditorI18n();
    return <span>{other.locale}</span>;
  }
  const { root, container } = mount();
  await act(async () =>
    root.render(
      <>
        <ConfigProvider>
          <ShellI18nBoundary localisation={options}>
            <VaultProvider vault={vault}>
              <AppReactContext.Provider value={{ instanceId: "test", appId: "test" }}>
                <EditingStack>
                  <Probe />
                </EditingStack>
              </AppReactContext.Provider>
            </VaultProvider>
          </ShellI18nBoundary>
        </ConfigProvider>
        <ConfigProvider>
          <ShellI18nBoundary localisation={options}>
            <Other />
          </ShellI18nBoundary>
        </ConfigProvider>
      </>
    )
  );
  await act(async () => {
    edit.edit({ resource: { type: "SpecificResource", source: resource } });
    await api.setLocale("nl");
    await api.setProfile("plain");
  });
  expect(container.textContent).toContain("Voorbeeld/https://example.org/m");
  expect(other.locale).toBe("en-GB");
  await act(async () => save({ uiI18n: { requiredNamespaces: ["shell"] } }));
  expect(api.locale).toBe("nl");
  expect(api.profile).toBe("plain");
  expect(mounts).toBe(1);
  expect(container.querySelector("input")?.value).toBe("unsaved");
  expect(container.textContent).toContain(resource.id);
  expect(JSON.stringify(vault.toPresentation3(resource))).toBe(before);
});

test("lazy manifest and loaded plugin registrations retranslate while retaining plugin/store state", async () => {
  const source = { label: "Test extension" };
  const registration = {
    owner: "test",
    namespace: "test-shell-plugin",
    sourceLocale: "en-GB",
    contract: createCatalogContract(source),
    loaders: { "en-GB": async () => source, nl: async () => ({ label: "Testuitbreiding" }) },
  };
  const plugins = [
    {
      default: {
        id: "test",
        label: "Legacy",
        labelMessage: { namespace: registration.namespace, key: "label" },
        localisation: { registrations: [registration], requiredNamespaces: [registration.namespace] },
      },
      load: async () => ({ default: { id: "test", label: "Legacy" } }),
    },
  ];
  let api!: ReturnType<typeof useEditorI18n>, store!: ReturnType<typeof usePluginStoreApi>;
  function Probe() {
    api = useEditorI18n();
    store = usePluginStoreApi();
    return <span>{api.resolveMessage(plugins[0]!.default.labelMessage, "Legacy")}</span>;
  }
  const { root, container } = mount();
  await act(async () =>
    root.render(
      <PluginProvider plugins={plugins}>
        <ConfigProvider>
          <ShellI18nBoundary localisation={options}>
            <AppReactContext.Provider value={{ instanceId: "test", appId: "test-app" }}>
              <PrimeAppReactContext.Provider
                value={{
                  metadata: { id: "test-app", title: "Test" },
                  layout: { leftPanels: [], rightPanels: [], centerPanels: [] },
                }}
              >
                <LayoutActionsReactContext.Provider value={{} as any}>
                  <PluginI18nBridge />
                  <PluginManager />
                  <Probe />
                </LayoutActionsReactContext.Provider>
              </PrimeAppReactContext.Provider>
            </AppReactContext.Provider>
          </ShellI18nBoundary>
        </ConfigProvider>
      </PluginProvider>
    )
  );
  await act(async () => {
    await api.loadNamespaces([registration.namespace]);
  });
  expect(container.textContent).toContain("Test extension");
  const originalStore = store;
  await act(async () => {
    store.getState().setPluginLoaded("test", normalisePlugin(await plugins[0]!.load()));
  });
  expect(store.getState().plugins[0]?.loadStatus).toBe("loaded");
  expect(store.getState().plugins[0]?.metadata.localisation?.requiredNamespaces).toContain(registration.namespace);
  await act(async () => {
    store.getState().enable("test-app", "test");
    await api.setLocale("nl");
  });
  expect(container.textContent).toContain("Testuitbreiding");
  expect(store).toBe(originalStore);
  expect(store.getState().apps["test-app"]?.enabled).toContain("test");
});

test("task context formatter is instance-bound; history descriptors survive JSON without functions or rewriting status/data", async () => {
  const i18n = createEditorI18n(options),
    vault = new Vault(),
    store = createBackgroundActionsStore();
  const target = {
    id: "https://example.org/m",
    type: "Manifest" as const,
    label: "Authored title",
    scope: "root" as const,
  };
  const definition = {
    id: "test",
    label: "Old",
    labelMessage: { namespace: "shell", key: "preview.open" },
    run: async (ctx: any) => {
      expect(ctx.i18n.resolveMessage(definition.labelMessage)).toBe("Preview");
      ctx.setActionLabel("Legacy label", definition.labelMessage);
      ctx.setActionStatus("running", "Legacy", { namespace: "shell", key: "background.running" });
      ctx.setResult({ id: "original-id", label: { cy: ["Teitl"] } });
    },
  };
  const instanceKey = getBackgroundActionInstanceKey(definition.id, target);
  await runBackgroundAction({
    store,
    context: {
      i18n,
      definition,
      target,
      instanceKey,
      rootResource: target,
      vault,
      tags: {} as any,
      canvasProgress: createManifestEditorCanvasProgressApi(vault),
      plugins: { getSettings: () => ({}) as any },
      config: mergeConfig(),
      layoutActions: {} as any,
      layoutState: {} as any,
    },
  });
  const instance = store.getState().instances[instanceKey]!;
  const clone = JSON.parse(JSON.stringify(instance));
  expect(clone.status).toBe("complete");
  expect(clone.target.label).toBe("Authored title");
  expect(clone.result).toEqual({ id: "original-id", label: { cy: ["Teitl"] } });
  expect(backgroundActionLabel(definition, clone, i18n)).toBe("Preview");
  await i18n.setLocale("nl");
  expect(backgroundActionLabel(definition, clone, i18n)).toBe("Voorbeeld");
  expect(backgroundActionStatus(clone, i18n)).toBe("Voltooid");
  expect(JSON.stringify(clone)).not.toContain("resolveMessage");
  store.getState().startAction(instanceKey, definition, target);
  const history = JSON.parse(JSON.stringify(store.getState().histories[instanceKey]));
  expect(history.length).toBeGreaterThan(0);
  expect(backgroundActionLabel(definition, history[0], i18n)).toBe("Voorbeeld");
});

test("specification feedback translates whole messages while authored expected values and machine fields stay intact", async () => {
  const vault = new Vault(),
    resource = { id: "https://example.org/m", type: "Manifest" as const };
  await vault.loadManifest(resource.id, { ...resource, label: { cy: ["Teitl"] }, items: [] });
  const specs = [
    {
      id: "test",
      label: "Host spec",
      rules: [{ type: "require-non-empty" as const, entityType: "Manifest" as const, path: ["summary"] }],
    },
  ];
  const i18n = createEditorI18n({ ...options, config: { defaultLocale: "nl" } });
  const report = evaluateSpecifications(specs, vault, resource, i18n);
  expect(report.results[0]?.message).toContain("moet worden ingevuld");
  expect(report.results[0]?.status).toBe("missing");
  expect(report.results[0]?.path).toEqual(["summary"]);
  expect(vault.get(resource).label).toEqual({ cy: ["Teitl"] });
});

test("creator forms receive the local formatter and mapped validation feedback retranslates without replacing the form", async () => {
  const { RenderCreator } = await import("../BaseCreator/BaseCreator");
  const { PrimeAppReactContext } = await import("../AppContext/AppContext");
  const { LayoutActionsReactContext } = await import("../Layout/Layout.context");
  const runtime = createEditorI18n(options),
    vault = new Vault();
  let formContext: any,
    mounts = 0;
  function Form({ ctx }: { ctx: any }) {
    formContext = ctx;
    const [value] = useState("unsaved title");
    useEffect(() => {
      mounts++;
    }, []);
    return <input value={value} readOnly />;
  }
  const failure = new RangeError("original diagnostic");
  const definition = {
    id: "test-creator",
    label: "Test",
    resourceType: "Canvas",
    resourceFields: [],
    supports: {},
    create: () => {
      throw failure;
    },
    validationErrorMessage: (error: unknown) =>
      error === failure
        ? { code: "bad-title", field: "title", message: { namespace: "shell", key: "creator.unknownError" } }
        : undefined,
    render: (ctx: any) => <Form ctx={ctx} />,
  };
  const { root, container } = mount();
  const app = {
    metadata: { id: "test", title: "Test" },
    layout: { creators: [definition], leftPanels: [], rightPanels: [], centerPanels: [] },
  };
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={runtime}>
        <ConfigProvider>
          <VaultProvider vault={vault}>
            <PrimeAppReactContext.Provider value={app}>
              <LayoutActionsReactContext.Provider value={{ modal: {}, edit() {}, open() {} } as any}>
                <RenderCreator creator={definition as any} resource={{ type: "Canvas" }} compact />
              </LayoutActionsReactContext.Provider>
            </PrimeAppReactContext.Provider>
          </VaultProvider>
        </ConfigProvider>
      </EditorI18nProvider>
    )
  );
  expect(formContext.i18n.resolveMessage({ namespace: "shell", key: "preview.open" })).toBe("Preview");
  await act(async () => {
    await formContext.runCreate({ title: "x" });
  });
  expect(container.textContent).toContain("Unknown error");
  await act(async () => {
    await runtime.setLocale("nl");
  });
  expect(container.textContent).toContain("Onbekende fout");
  expect(container.querySelector("input")?.value).toBe("unsaved title");
  expect(mounts).toBe(1);
  expect(formContext.i18n.resolveMessage({ namespace: "shell", key: "preview.open" })).toBe("Voorbeeld");
});

test("adding and removing a preset override under a controlled host preserves mounted state and host callbacks", async () => {
  const runtime = createEditorI18n(options),
    request = vi.fn();
  let mounts = 0,
    api!: ReturnType<typeof useEditorI18n>;
  function Probe() {
    api = useEditorI18n();
    const [value] = useState("draft");
    useEffect(() => {
      mounts++;
    }, []);
    return <input value={value} readOnly />;
  }
  const { root, container } = mount();
  const render = (override: boolean) => (
    <EditorI18nProvider instance={runtime} locale="en-GB" onLocaleChange={request}>
      <ConfigProvider>
        <ShellI18nBoundary localisation={override ? options : undefined}>
          <Probe />
        </ShellI18nBoundary>
      </ConfigProvider>
    </EditorI18nProvider>
  );
  await act(async () => root.render(render(false)));
  await act(async () => root.render(render(true)));
  await act(async () => {
    await api.setLocale("nl");
  });
  expect(request).toHaveBeenCalledWith("nl");
  expect(api.locale).toBe("en-GB");
  await act(async () => root.render(render(false)));
  expect(container.querySelector("input")?.value).toBe("draft");
  expect(mounts).toBe(1);
});

test("a running task formatter follows explicit runtime resource replacement in the same editor", async () => {
  let formatter!: ReturnType<typeof useBackgroundActionFormatter>;
  function Probe() {
    formatter = useBackgroundActionFormatter();
    return null;
  }
  const { root } = mount();
  const render = (localisation: typeof options) => (
    <ConfigProvider>
      <ShellI18nBoundary localisation={localisation}>
        <Probe />
      </ShellI18nBoundary>
    </ConfigProvider>
  );
  await act(async () => root.render(render(options)));
  const runningContextFormatter = formatter,
    runningTranslate = formatter.translate("shell");
  expect(runningTranslate("preview.open")).toBe("Preview");
  const replacement = { ...options, host: { "en-GB": { shell: { preview: { open: "Updated preview" } } } } };
  await act(async () => root.render(render(replacement)));
  expect(formatter).toBe(runningContextFormatter);
  expect(runningTranslate("preview.open")).toBe("Updated preview");
});

test("shell policy cannot widen the inherited host locale allow-list", async () => {
  const runtime = createEditorI18n({ ...options, config: { defaultLocale: "nl", availableLocales: ["nl"] } });
  const request = vi.fn();
  let api!: ReturnType<typeof useEditorI18n>;
  function Probe() {
    api = useEditorI18n();
    return <span>{api.locale}</span>;
  }
  const { root } = mount();
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={runtime} locale="nl" onLocaleChange={request}>
        <ConfigProvider config={{ uiI18n: { availableLocales: ["en-GB", "nl"] } }}>
          <ShellI18nBoundary localisation={options}>
            <Probe />
          </ShellI18nBoundary>
        </ConfigProvider>
      </EditorI18nProvider>
    )
  );
  expect(api.availableLocales.map((locale) => locale.id)).toEqual(["nl"]);
  await expect(api.setLocale("en-GB")).rejects.toThrow("Unavailable shell locale");
  expect(request).not.toHaveBeenCalled();
  expect(api.locale).toBe("nl");
});

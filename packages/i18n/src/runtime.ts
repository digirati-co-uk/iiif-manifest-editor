import { createInstance, type i18n } from "i18next";
import { composeResources } from "@manifest-editor/languages/composition";
import { createCatalogRegistry, createLatestLoader } from "@manifest-editor/languages/loaders";
import { createI18nextOptions, resolveUiSelection } from "@manifest-editor/languages/selection";
import { createCatalogContract, resourceCoverage } from "@manifest-editor/languages/validation";
import { assertRecord, flattenCatalog } from "@manifest-editor/languages/schema";
import { builtinCatalogs, builtinPlain } from "./builtins";
import type {
  Catalog,
  CatalogContract,
  EditorI18n,
  EditorI18nOptions,
  EditorI18nSnapshot,
  MessageReference,
  ResourceStore,
  Translate,
  UiI18nConfig,
} from "./types";

export const defaultLocales = Object.freeze([
  { id: "en-GB", nativeName: "English (United Kingdom)", direction: "ltr" as const },
]);
/** Metadata hook only: supply Dutch catalogs/loaders before enabling this locale. */
export const dutchLocale = Object.freeze({ id: "nl", nativeName: "Nederlands", direction: "ltr" as const });
const engines = new WeakMap<EditorI18n, () => i18n>();
export function engineFor(runtime: EditorI18n): i18n {
  const get = engines.get(runtime);
  if (!get) throw new TypeError("Expected an editor i18n runtime created by createEditorI18n");
  return get();
}

// Validate before copying; never mutate supplied catalog objects.
function merge(left: Catalog, right: Catalog): Catalog {
  flattenCatalog(right);
  const result: Record<string, string | Catalog> = { ...left };
  for (const [key, value] of Object.entries(right)) {
    const previous = result[key];
    if (previous !== undefined && typeof previous !== typeof value)
      throw new TypeError(`Catalog shape changed: ${key}`);
    result[key] = typeof value === "string" ? value : merge(typeof previous === "object" ? previous : {}, value);
  }
  return result;
}

/** Synchronous, request-local initialization with no browser detection or global engine. */
export function createEditorI18n(options: EditorI18nOptions = {}): EditorI18n {
  const locales = options.locales || defaultLocales;
  const config: UiI18nConfig = {
    defaultLocale: "en-GB",
    availableLocales: locales.map((item) => item.id),
    fallbackLocale: "en-GB",
    defaultProfile: "standard",
    availableProfiles: ["standard", "plain"],
    ...options.config,
  };
  const registry = createCatalogRegistry();
  for (const registration of options.registrations || []) registry.register(registration);
  const base: Record<string, Record<string, Catalog>> = {};
  for (const store of [builtinCatalogs, options.catalogs || {}]) {
    assertRecord(store, "resources");
    for (const [locale, namespaces] of Object.entries(store)) {
      assertRecord(namespaces, locale);
      base[locale] ||= {};
      for (const [namespace, catalog] of Object.entries(namespaces))
        base[locale][namespace] = merge(base[locale][namespace] || {}, catalog);
    }
  }
  const contracts: Record<string, CatalogContract> = { ...registry.contracts() };
  for (const [namespace, source] of Object.entries(base[config.fallbackLocale] || {})) {
    // Named rich components are safe only after validation disallows attributes.
    const richText = [...flattenCatalog(source)].filter(([, text]) => /<[A-Za-z]/.test(text)).map(([key]) => key);
    contracts[namespace] ||= createCatalogContract(source, { richText });
  }
  let namespaces = [
    ...new Set([
      ...Object.values(base).flatMap((catalogs) => Object.keys(catalogs)),
      ...(options.requiredNamespaces || []),
      ...registry.namespaces(),
    ]),
  ];
  let desired: { locale?: string; profile?: string } = { locale: options.locale, profile: options.profile };
  const listeners = new Set<() => void>();
  const selectionFor = (request: typeof desired) =>
    resolveUiSelection(config, locales, options.policies, {
      ...options,
      ...request,
    });
  function prepare(request: typeof desired, loaded: ResourceStore = {}) {
    const selection = selectionFor(request);
    // Loaded namespace source contracts were validated by the registry.
    const allContracts = { ...contracts, ...registry.contracts() };
    const resources = composeResources(
      {
        base,
        presets: [loaded, ...(options.presets || [])],
        profile: composeResources(
          {
            base: selection.profile === "plain" ? builtinPlain : {},
            host: options.profiles?.[selection.profile],
          },
          allContracts
        ),
        presetProfile: options.presetProfiles?.[selection.profile],
        host: options.host,
      },
      allContracts
    );
    const engine = createInstance();
    // Supplied resources + initAsync:false initialize before the first SSR render.
    void engine.init({
      ...createI18nextOptions(selection, namespaces),
      resources,
      initAsync: false,
      interpolation: { escapeValue: false, skipOnVariables: true },
      react: { useSuspense: false, transSupportBasicHtmlNodes: false },
    });
    const coverage = resourceCoverage(
      resources,
      allContracts,
      selection.locale,
      options.requiredNamespaces || namespaces
    );
    const snapshot: EditorI18nSnapshot = Object.freeze({
      locale: selection.locale,
      profile: selection.profile,
      direction: selection.direction,
      localeChain: selection.localeChain,
      availableLocales: Object.freeze(locales.filter((item) => selection.availableLocales.includes(item.id))),
      availableProfiles: selection.availableProfiles,
      loading: false,
      error: null,
      coverage: Object.freeze({
        complete: coverage.complete,
        missing: Object.freeze(
          coverage.namespaces.flatMap((entry) =>
            entry.missing
              .map((key) => `${entry.namespace}:${key}`)
              .concat(entry.issues.filter((issue) => issue.code === "namespace").map(() => `${entry.namespace}:*`))
          )
        ),
      }),
    });
    return { engine, snapshot };
  }
  let current = prepare(desired);
  desired = { locale: current.snapshot.locale, profile: current.snapshot.profile };
  let snapshot = current.snapshot;
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const loader = createLatestLoader(async (request: typeof desired) => {
    const selection = selectionFor(request);
    const loaded = await registry.load(
      selection.localeChain,
      registry.namespaces().filter((ns) => namespaces.includes(ns))
    );
    return prepare(request, loaded);
  });
  async function select(request: typeof desired): Promise<void> {
    desired = { ...desired, ...request };
    snapshot = Object.freeze({ ...snapshot, loading: true, error: null });
    emit();
    try {
      const result = await loader.load({ ...desired });
      if (result.status === "superseded") return;
      current = result.value;
      snapshot = current.snapshot;
      desired = { locale: snapshot.locale, profile: snapshot.profile };
      emit();
    } catch (cause) {
      desired = { locale: current.snapshot.locale, profile: current.snapshot.profile };
      snapshot = Object.freeze({
        ...current.snapshot,
        error: cause instanceof Error ? cause : new Error(String(cause)),
      });
      emit();
      throw snapshot.error;
    }
  }
  function translate(namespace: string): Translate {
    return (key, values, translationOptions) => {
      const result = current.engine.t(key, {
        replace: values,
        count: typeof values?.count === "number" ? values.count : undefined,
        ...translationOptions,
        ns: namespace,
        returnDetails: true,
        returnObjects: false,
        interpolation: { escapeValue: false, skipOnVariables: true },
      });
      const missing = !current.engine.exists(key, {
        count: typeof values?.count === "number" ? values.count : undefined,
        ns: namespace,
      });
      if (missing || result.usedLng !== snapshot.locale)
        options.onDiagnostic?.({
          kind: missing ? "missing" : "fallback",
          locale: snapshot.locale,
          resolvedLocale: result.usedLng,
          namespace,
          key,
        });
      return typeof result.res === "string" ? result.res : translationOptions?.defaultValue || key;
    };
  }
  const runtime: EditorI18n = Object.freeze({
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    select,
    setLocale: (locale: string) => select({ locale }),
    setProfile: (profile: string) => select({ profile }),
    async loadNamespaces(extra: readonly string[]) {
      namespaces = [...new Set([...namespaces, ...extra])];
      await select({});
    },
    async register(registration: Parameters<EditorI18n["register"]>[0]) {
      registry.register(registration);
      namespaces = [...new Set([...namespaces, registration.namespace])];
      await select({});
    },
    translate,
    resolveMessage(reference: MessageReference | string | undefined, fallback?: string) {
      if (typeof reference === "string") return reference;
      if (!reference) return fallback ?? "";
      return translate(reference.namespace)(reference.key, reference.values, {
        defaultValue: reference.defaultValue ?? fallback,
      });
    },
  });
  engines.set(runtime, () => current.engine);
  return runtime;
}

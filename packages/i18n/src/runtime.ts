import { createInstance, type i18n } from "i18next";
import { composeResources } from "@manifest-editor/languages/composition";
import { createCatalogRegistry, createLatestLoader } from "@manifest-editor/languages/loaders";
import { createI18nextOptions, resolveUiSelection } from "@manifest-editor/languages/selection";
import { assertValidCatalog, createCatalogContract, resourceCoverage } from "@manifest-editor/languages/validation";
import { assertRecord, flattenCatalog } from "@manifest-editor/languages/schema";
import { builtinCatalogs, builtinPlain } from "./builtins";
import { createResourceLoader } from "./resource-loaders";
import type {
  Catalog,
  CatalogContract,
  EditorI18n,
  EditorI18nOptions,
  EditorI18nResources,
  EditorI18nSnapshot,
  MessageReference,
  ResourceStore,
  CatalogRegistration,
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
  const result: Record<string, string | Catalog> = { ...left };
  for (const [key, value] of Object.entries(right)) {
    const previous = result[key];
    if (previous !== undefined && typeof previous !== typeof value)
      throw new TypeError(`Catalog shape changed: ${key}`);
    result[key] = typeof value === "string" ? value : merge(typeof previous === "object" ? previous : {}, value);
  }
  return result;
}

function compileCatalogs(catalogs: ResourceStore | undefined, fallbackLocale: string) {
  const base: Record<string, Record<string, Catalog>> = {};
  for (const store of [builtinCatalogs, catalogs || {}]) {
    assertRecord(store, "resources");
    for (const [locale, namespaces] of Object.entries(store)) {
      assertRecord(namespaces, locale);
      base[locale] ||= {};
      for (const [namespace, catalog] of Object.entries(namespaces)) {
        // Validate the whole tree once before copying, rather than again at every branch.
        flattenCatalog(catalog);
        base[locale][namespace] = merge(base[locale][namespace] || {}, catalog);
      }
    }
  }
  const contracts: Record<string, CatalogContract> = {};
  for (const [namespace, source] of Object.entries(base[fallbackLocale] || {})) {
    const richText = [...flattenCatalog(source)].filter(([, text]) => /<[A-Za-z]/.test(text)).map(([key]) => key);
    contracts[namespace] = createCatalogContract(source, { richText });
  }
  return { base, contracts, resources: new Map<boolean, ResourceStore>() };
}

// Only package-owned defaults are shared. Host catalogs are copied and validated per runtime;
// engines, loaders, selections and listeners remain request-local, including SSR and CDN hosts.
let defaults: ReturnType<typeof compileCatalogs> | undefined;

function hasResources(store: ResourceStore | undefined) {
  if (store === undefined) return false;
  assertRecord(store, "resources");
  return Object.keys(store).length !== 0;
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
  let registry = createCatalogRegistry();
  const loadResources = createResourceLoader(options.resourceLoaders);
  const builtinOnly = !hasResources(options.catalogs) && config.fallbackLocale === "en-GB";
  const compiled = builtinOnly
    ? (defaults ||= compileCatalogs(undefined, config.fallbackLocale))
    : compileCatalogs(options.catalogs, config.fallbackLocale);
  const { base, contracts } = compiled;
  const builtinNamespaces = new Set(Object.values(builtinCatalogs).flatMap((catalogs) => Object.keys(catalogs)));
  function checkRegistration(registration: CatalogRegistration) {
    const firstPartyOwner = registration.namespace.startsWith("plugin-")
      ? `@manifest-editor/${registration.namespace.slice(7)}`
      : undefined;
    if (builtinNamespaces.has(registration.namespace) && registration.owner !== firstPartyOwner)
      throw new TypeError(`Namespace is owned by the editor: ${registration.namespace}`);
    // A host may preload a plugin's source for SSR, but its declared contract must agree.
    for (const [locale, namespaces] of Object.entries(base)) {
      if (Object.hasOwn(namespaces, registration.namespace))
        assertValidCatalog(namespaces[registration.namespace], registration.contract, { locale, complete: false });
    }
  }
  for (const registration of options.registrations || []) {
    checkRegistration(registration);
    registry.register(registration);
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
  function prepare(
    request: typeof desired,
    loaded: ResourceStore = {},
    activeRegistry = registry,
    activeNamespaces = namespaces,
    bundles: readonly EditorI18nResources[] = []
  ) {
    const selection = selectionFor(request);
    // Loaded namespace source contracts were validated by the registry.
    const allContracts = { ...contracts, ...activeRegistry.contracts() };
    const reusable =
      builtinOnly &&
      !options.presets?.length &&
      !hasResources(options.host) &&
      !hasResources(options.profiles?.[selection.profile]) &&
      !hasResources(options.presetProfiles?.[selection.profile]) &&
      !bundles.length &&
      !Object.keys(loaded).length;
    const plain = selection.profile === "plain";
    const resources =
      (reusable && compiled.resources.get(plain)) ||
      composeResources(
        {
          base,
          presets: [
            ...bundles.map((bundle) => bundle.catalogs || {}),
            ...(bundles.length && options.catalogs ? [options.catalogs] : []),
            loaded,
            ...bundles.flatMap((bundle) => bundle.presets || []),
            ...(options.presets || []),
          ],
          profile: composeResources(
            {
              base: selection.profile === "plain" ? builtinPlain : {},
              presets: bundles.map((bundle) => bundle.profiles?.[selection.profile] || {}),
              host: options.profiles?.[selection.profile],
            },
            allContracts
          ),
          presetProfile: composeResources(
            {
              base: {},
              presets: bundles.map((bundle) => bundle.presetProfiles?.[selection.profile] || {}),
              host: options.presetProfiles?.[selection.profile],
            },
            allContracts
          ),
          host: options.host,
        },
        allContracts
      );
    if (reusable) compiled.resources.set(plain, resources);
    const engine = createInstance();
    // Supplied resources + initAsync:false initialize before the first SSR render.
    void engine.init({
      ...createI18nextOptions(selection, activeNamespaces),
      resources,
      initAsync: false,
      interpolation: { escapeValue: false, skipOnVariables: true },
      react: { useSuspense: false, transSupportBasicHtmlNodes: false },
    });
    const coverage = resourceCoverage(
      resources,
      allContracts,
      selection.locale,
      options.requiredNamespaces || activeNamespaces
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
  let selectionVersion = 0;
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const loader = createLatestLoader(async (request: typeof desired) => {
    const selection = selectionFor(request);
    const [loaded, bundles] = await Promise.all([
      registry.load(
        selection.localeChain,
        registry.namespaces().filter((ns) => namespaces.includes(ns))
      ),
      loadResources(selection.localeChain, { ...contracts, ...registry.contracts() }),
    ]);
    return prepare(request, loaded, registry, namespaces, bundles);
  });
  async function select(request: typeof desired): Promise<void> {
    const requestVersion = ++selectionVersion;
    desired = { ...desired, ...request };
    snapshot = Object.freeze({ ...snapshot, loading: true, error: null });
    emit();
    try {
      const result = await loader.load({ ...desired });
      if (result.status === "superseded" || requestVersion !== selectionVersion) return;
      current = result.value;
      snapshot = current.snapshot;
      desired = { locale: snapshot.locale, profile: snapshot.profile };
      emit();
    } catch (cause) {
      if (requestVersion !== selectionVersion) return;
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
  let registrationQueue = Promise.resolve();
  async function stageRegistration(registration: CatalogRegistration) {
    checkRegistration(registration);
    const staged = registry.clone();
    staged.register(registration);
    // Validate the source even when it is not in the current locale's fallback chain.
    await staged.load([registration.sourceLocale], [registration.namespace]);
    for (;;) {
      const version = selectionVersion;
      const request = { ...desired };
      const selection = selectionFor(request);
      const activeNamespaces = [...new Set([...namespaces, registration.namespace])];
      let prepared: ReturnType<typeof prepare>;
      try {
        const [loaded, bundles] = await Promise.all([
          staged.load(
            selection.localeChain,
            staged.namespaces().filter((namespace) => activeNamespaces.includes(namespace))
          ),
          loadResources(selection.localeChain, { ...contracts, ...staged.contracts() }),
        ]);
        prepared = prepare(request, loaded, staged, activeNamespaces, bundles);
      } catch (error) {
        // A failed obsolete locale must not reject a valid registration for the latest selection.
        if (version !== selectionVersion) continue;
        throw error;
      }
      // Follow a user's newer locale/profile request before publishing any registration state.
      if (version !== selectionVersion) continue;
      selectionVersion++;
      registry = staged;
      namespaces = activeNamespaces;
      current = prepared;
      snapshot = prepared.snapshot;
      desired = { locale: snapshot.locale, profile: snapshot.profile };
      emit();
      return;
    }
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
    register(registration: CatalogRegistration) {
      const pending = registrationQueue.then(() => stageRegistration(registration));
      registrationQueue = pending.catch(() => {});
      return pending;
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

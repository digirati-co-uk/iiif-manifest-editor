# Shared editor UI translations

`@manifest-editor/i18n` owns the shared React context and creates an isolated i18next instance for each provider/runtime. It never reads or changes IIIF content languages, resource values, IDs, editing state, storage, browser preferences, or the document's global language.

```tsx
import { EditorI18nProvider, useTranslations, useEditorI18n } from "@manifest-editor/i18n";

function Save() {
  const t = useTranslations("common");
  const { locale, setProfile, loading, error } = useEditorI18n();
  return <button>{t("actions.save")}</button>;
}

<EditorI18nProvider>
  <Save />
</EditorI18nProvider>;
```

The provider's options are initialization defaults, except `locale`/`profile`, which are controlled props. Use `defaultLocale`/`defaultProfile` inside `config` for uncontrolled defaults. Controlled `select`, `setLocale` and `setProfile` request changes through `onLocaleChange`/`onProfileChange`; the host supplies the new props. For configuration/resource replacement, create a new instance explicitly and pass `instance`. Neither selection nor instance replacement keys/remounts children. A supplied instance owns its initial configuration; provider configuration props do not reconfigure it. Avoid supplying conflicting initial instance and controlled selections during SSR.

`useEditorI18n()` returns `locale`, `profile`, `direction`, locale metadata in `availableLocales`, profile IDs in `availableProfiles`, `localeChain`, `loading`, `error`, `coverage`, and all instance methods. `setLocale`, `setProfile`, `select`, `register` and `loadNamespaces` return promises. Handle rejected selection/loading calls; the last good snapshot stays visible. `coverage.missing` excludes fallback and identifies `namespace:key` paths; `onDiagnostic` reports individual string lookups that use fallback or are missing, without interpolation values. Rich rendering uses the same validated catalogs; it does not emit per-lookup diagnostics.

```ts
import { createEditorI18n, createMessageReference } from "@manifest-editor/i18n/core";
const runtime = createEditorI18n();
const reference = createMessageReference("common", "status.selected", { values: { count: 2 } });
runtime.resolveMessage(reference, "Selected items");
runtime.translate("plugin-example")("new.key", { count: 2 }, { defaultValue: "Two items" });
await runtime.setProfile("plain");
```

Translation keys/namespaces remain open strings. Values are finite serialisable primitives. Use the third `t` argument for `defaultValue`; interpolation values cannot override engine options. `resolveMessage` accepts a reference, a legacy string, or undefined. Do not route authored InternationalString values or protocol data through it.

For full sentences use `<EditorTrans reference={reference} components={{link: <a href="/help">Help</a>}} />`. Source contracts declare named tags through `createCatalogContract(source, {richText: ['sentence.key']})`. Catalogs cannot set HTML attributes or callbacks. Interpolation values become literal React text nodes, including angle brackets and braces; they cannot introduce tags or override engine options. Component keys must be named tags, never numeric indices. The `i18nvalue` tag prefix is reserved for safe interpolation. Fallback strings follow the same markup contract. Standard React text escaping applies; there is no `dangerouslySetInnerHTML`. Portals retain the React context; wrap their DOM content in `EditorI18nScope` to inherit `lang`/`dir` explicitly.

## Catalogs and plugins

English catalogs and plain overlays are imported synchronously from the private authoring sources in `src/builtins.ts`. Existing files automatically pick up source edits; add newly introduced built-in namespaces to that map or register them explicitly. These are the foundation catalogs, not a claim that all application UI has migrated. Runtime packaging inlines private helpers/data, while React, i18next and react-i18next stay external. Every independently published UI/plugin package must depend on and externalize **this package**, so the host and plugin resolve one context module. Do not bundle a copy of its provider.

`catalogs` extends source catalogs and supplies other locales. `presets` is an ordered array of resource stores. `profiles[profile]`, `presetProfiles[profile]`, and `host` apply in that order after presets. Standard English fallback is composed with the selected wording profile. No state or resources are changed until a new snapshot is ready.

`locales` supplies native names/direction; `config.availableLocales` and `availableProfiles` constrain selection. Host policy intersects optional preset `policies`. Selection precedence is controlled values, explicitly supplied persisted choices, explicitly supplied preferred locales, preset defaults, host defaults. All negotiation is explicit and SSR safe. Metadata alone does not provide translations. Dutch data is available through the optional server-safe `@manifest-editor/i18n/nl` entry; the default runtime remains English. Enable reviewed Dutch catalogs and plain overlays explicitly:

```ts
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
const runtime = createEditorI18n({
  locales: [...defaultLocales, dutchLocale],
  catalogs: dutchCatalogs,
  profiles: { plain: dutchPlain },
  config: { defaultLocale: "nl" },
});
```

The same entry exports `dutchExhibition` and `dutchExhibitionPlain` for explicit preset composition. Source catalog edits are reflected by these imports. Coverage proves the currently declared messages, not all repository UI; each consumer module must expand and migrate its own namespace. The web host owns locale persistence and the picker.

```ts
import { createEditorI18n, createCatalogContract, defaultLocales, dutchLocale } from "@manifest-editor/i18n";
const source = { run: "Run {{name}}" };
const runtime = createEditorI18n({
  locales: [...defaultLocales, dutchLocale],
  requiredNamespaces: ["plugin-example"],
  registrations: [
    {
      owner: "example-plugin",
      namespace: "plugin-example",
      sourceLocale: "en-GB",
      contract: createCatalogContract(source),
      loaders: { "en-GB": async () => source }, // add nl loader when its reviewed catalog exists
    },
  ],
});
await runtime.loadNamespaces(["plugin-example"]);
// Later plugins: await runtime.register(registration).
```

Provider mount loads configured registrations automatically. Non-React callers explicitly await `loadNamespaces` before using asynchronous catalogs. Failed loads can be retried. Dynamic registrations are staged and committed atomically; rejected registrations leave namespace ownership, contracts and resources unchanged. Built-in namespaces are reserved; a seeded `plugin-example` namespace may be registered only by its first-party owner `@manifest-editor/example`, using a contract compatible with its preloaded data. Registrations under new namespaces remain open to third parties. Concurrent registrations are serialized and follow the latest locale/profile selection. Superseded selections never commit, including stale failures; loaders are cached per runtime and coalesced. In-flight network operations are not aborted, and asynchronous loaders must have their own network cancellation policy if needed. React subscriptions clean up on unmount. Runtime instances are not global singletons.

For SSR/hydration supply identical synchronous `catalogs`, selection, and configuration to server and client. Async-only registrations initially show validated fallback/missing coverage and load after mount. Preload externally and pass the loaded resources as `catalogs` when first-render translation parity is required. No browser detection or storage reads run during initialization.

## Development and release boundary

Workspace imports resolve `src/index.ts` directly: no manual build is needed for Next/Vite development. `publishConfig` replaces source entry points with ESM/CJS and declarations in `dist`. `tsdown.config.ts` bundles only the private authoring package, never the shared public runtime into consumers. The root entry is a React client boundary for Next.js; pass serialisable provider options from server components. Import runtime factories, formatting, references and types from `@manifest-editor/i18n/core` in server components, Node/worker/task code. This entry has no React import or client directive. The configured publication banner applies only to the React entry; actual emitted RSC entry behavior remains a release check. Integration boundaries can call `useOptionalEditorI18nInstance()` to detect an actual inherited provider, without creating a standalone fallback. Inherit that provider directly when no explicit override is requested so its controlled callbacks remain authoritative; do not pass the snapshot object from `useEditorI18n()` as a provider instance. The package's publication build/prepack is configured but was **not run** during this task, as repository instructions prohibit builds. Tarball resolution, emitted declarations, installed-plugin identity and browser distribution integration remain release checks for module 29.

Bootstrap: `pnpm install --ignore-scripts --filter @manifest-editor/i18n...` records both the private languages importer and new runtime importer. No root script or workspace glob change is needed. pnpm also updates peer-resolution snapshots when adding the new engine and jsdom test dependency.

Checks: `pnpm --filter @manifest-editor/i18n test`, `typecheck`, and `lint`. Tests use Vitest, actual i18next, React 19, react-dom and jsdom; there is no Next server, production browser, or whole-editor fixture involved. The form/undo regression test uses mounted React state, not the complete editor's undo store. Parent integration owns browser verification against its existing port-3000 server.

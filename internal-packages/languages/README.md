# Manifest Editor language catalogs

`@manifest-editor/languages` is a **private, source-only workspace package** for UI messages and their composition rules. It has no production dependencies and no build step. Direct `.ts` exports support workspace authoring; published editor packages must eventually bundle catalog data or emit public locale assets.

This package does not translate IIIF content. It also does not create a React provider or initialize i18next. That shared public runtime is the [first consumer integration task](implementation/modules/01-public-runtime.md).

## What is implemented

- 264 English seed messages in 19 namespaces, with typed semantic IDs and named interpolation values.
- Plain-wording overlays for shared editors, creators, manifest and exhibition text.
- Exhibition wording and exhibition/plain intersection overlays.
- Deferred, serialisable message references for module-level definitions.
- Contract validation for keys, non-empty text, placeholders, declared rich tags and locale-specific cardinal plurals.
- Immutable composition with explicit base, inherited preset, profile, preset/profile and host precedence, kept separate per locale.
- UI locale/profile selection, allow-list and inherited-preset restrictions, text direction and fallback-chain resolution.
- Isolated namespace registries, lazy loaders, concurrent-load caching, failed-load retries and latest-selection commit protection.
- Seed/namespace coverage checks and pseudo-localisation that preserves interpolation names and rich tags.
- Translator notes and validated JSON export/import tools that write only inside this package.
- A [task guide for each module](implementation/README.md) and regenerable [source inventories](implementation/inventories/README.md).

**Only English is registered as a real built-in UI locale.** The catalogs are a starting set, not a claim that the existing application is translated. No application package currently consumes them. French, Welsh and other languages must be supplied, validated and reviewed before being advertised. Pseudo-locales are for QA, not language support.

## Run checks without changing the workspace

From the repository root, use the already-installed tools:

```sh
npm --prefix internal-packages/languages test
npm --prefix internal-packages/languages run typecheck
npm --prefix internal-packages/languages run validate
npm --prefix internal-packages/languages run translations:check
npm --prefix internal-packages/languages run inventory -- --check
```

Use Node 22.18+ for built-in TypeScript stripping. Tests use Node's test runner; the source uses erasable TypeScript only. Typechecking uses the existing workspace TypeScript executable. No package builds or dev-server changes are needed.

The root lockfile importer is intentionally deferred to the later workspace bootstrap task. On this repository's pnpm version, invoking a new workspace through pnpm can automatically synchronize the root lockfile and run lifecycle hooks. The commands above avoid that side effect during package-only work. After cross-workspace integration, normal pnpm workflows can be used.

## Package layout

```text
src/
  schema.ts           Plain-data types, safe shapes, locale normalization
  catalog-types.ts    Type-only view of source catalogs
  messages.ts         Typed deferred references; open plugin-reference API
  validation.ts       Source contracts, translation checks, coverage
  composition.ts      Immutable per-locale override composition
  selection.ts        Host/preset selection policy and i18next options
  loaders.ts          Namespace ownership, lazy cache and latest-load staging
  pseudo.ts           QA text expansion without corrupting syntax
  catalogs.ts         Opt-in built-in seed loader registry
  locales/en-GB/      One file per namespace
  profiles/plain/    Partial wording overlays
  presets/exhibition/ Shared-editor wording and profile intersection
implementation/
  modules/            Individually actionable migration guides
  inventories/        Generated source locations and candidate lists
test/                 Behaviour and compile-time contract checks
```

The root export contains utilities and types; it does not import the catalog registry or all languages. Import a catalog by its subpath, or opt into the registry. There are no global engine/resource singletons.

## Use source catalogs and typed references

```ts
import { catalog as editors } from "@manifest-editor/languages/locales/en-GB/editors";
import { message } from "@manifest-editor/languages";
import type { CatalogOverlay, SourceCatalogs } from "@manifest-editor/languages";

const plain: CatalogOverlay<SourceCatalogs["editors"]> = {
  fields: { label: "Title" },
};

const reference = message("editors", "canvas.count", {
  values: { count: 3 },
});
// { namespace: "editors", key: "canvas.count", values: { count: 3 } }
```

Unknown built-in namespaces/keys and missing interpolation values fail typechecking. Plural alias keys such as `canvas.count` use the source `_other` message to infer variables. `count` is typed as a number. All source plural variants currently require the same placeholders/tags. The open `createMessageReference` helper supports plugin-local namespaces whose contracts will be registered at runtime.

References deliberately do not resolve to English at module import. The future public runtime should resolve them on render. During migration, add optional `labelMessage`/`descriptionMessage` fields alongside old string fallbacks, rather than immediately breaking every public definition contract.

## Prepare the built-in seed resources

```ts
import { prepareBuiltinResources } from "@manifest-editor/languages/catalogs";

const snapshot = await prepareBuiltinResources({
  namespaces: ["common", "editors", "manifest"],
  profile: "plain",
  preset: "exhibition",
});

snapshot.resources["en-GB"].editors.canvas.add; // "Add slide"
snapshot.resources["en-GB"].editors.fields.label; // "Title"
snapshot.coverage; // "seed"
```

Only requested source namespaces and relevant overlays are loaded. Production hosts will supply their own locale loaders and required namespaces through the public runtime. `prepareBuiltinResources` is a package-level seed demonstration, not the final React integration API.

## Compose resources and language policy

`composeResources(layers, contracts)` validates and deep-merges each locale independently in this priority order: base; parent-to-child presets; selected wording profile; preset/profile intersection; host override. Each call returns a new deeply frozen snapshot. Rebuilding from immutable inputs prevents stale overrides when leaving a profile.

Missing overlay values inherit. Undefined leaves are absent; null, arrays, unsafe keys, accessors, circular structures and unknown message paths are rejected. Required labels cannot become blank. English fallback resources remain in their own locale so the engine uses the correct fallback plural rules.

`resolveUiSelection` takes serialisable UI configuration, locale metadata, inherited preset policies and explicit/persisted/browser preferences. Controlled choices win; invalid controlled choices fail, invalid stored choices are ignored. Restrictions intersect, empty intersections fail, child preset defaults win among permitted choices, and the first permitted host option is the last resort if defaults are restricted out. Matching follows exact tags and parent tags, without guessing another region's locale.

The internal contract uses `defaultProfile`; the final shell API must document its public persisted field name. UI policy is independent of existing content `Config.i18n`.

`createI18nextOptions` supplies explicit fallback languages and `load: "currentOnly"`. Pass these options and composed resources into an **instance**, not the global i18next singleton. Its `escapeValue: false` assumes safe React/text-node rendering; it is not permission to inject formatted text with `innerHTML`. Do not use HTML-producing interpolation for user content.

## Register external catalogs

```ts
import {
  createCatalogContract,
  createCatalogRegistry,
  composeResources,
} from "@manifest-editor/languages";

const source = { open: "Open", greeting: "Hello {{name}}" } as const;
const registry = createCatalogRegistry();
registry.register({
  owner: "museum-plugin",
  namespace: "plugin-museum",
  sourceLocale: "en-GB",
  contract: createCatalogContract(source),
  loaders: {
    "en-GB": async () => source,
    fr: async () => ({ open: "Ouvrir", greeting: "Bonjour {{name}}" }),
  },
});
const base = await registry.load(["fr", "en-GB"], ["plugin-museum"]);
const resources = composeResources({ base }, registry.contracts());
```

Namespace collisions fail, including attempts to take over an existing owner's namespace. Requested source catalogs are complete against their contracts; translated catalogs may be partial for fallback. Use `resourceCoverage` for strict required-namespace availability: fallback English is not counted as translated coverage. Registration should occur per editor so hosts cannot affect each other.

`createLatestLoader(prepare)` stages asynchronous resource work and publishes only the latest successful value. It retains the previous snapshot on failure. It does not cancel downloads or update React by itself; the public runtime must subscribe/commit the prepared selection and resource store together.

## Catalog authoring rules

Use semantic IDs by intent and namespace. Shared English spelling does not imply the same meaning. Keep labels/IDs/values distinct, and translate complete sentences rather than replacing domain nouns inside arbitrary text.

The initial contract supports nested string catalogs, named `{{variables}}`, cardinal plural suffixes, and explicitly declared balanced rich tags such as `<link>`. It rejects HTML attributes, unknown/missing variables and unsupported interpolation/nesting syntax. Runtime formatting belongs to i18next; this package does not implement a replacement formatter.

ICU/MF2 messages, ordinal plurals, interpolation formatter arguments, arbitrary HTML and executable translation values are **not** supported by this initial validator/type contract. Add support deliberately across authoring, validation, typing and runtime before using them. Optional empty messages require an explicit contract exception and an appropriate runtime `returnEmptyString` policy; the default engine options reject empty output.

Keep one authoritative source per catalog. The current source is TypeScript. The [translator exchange tools](translations/README.md) export ignored JSON review copies and validate incoming JSON before writing a target TypeScript catalog. They do not enable a locale or overwrite source English. Profile/preset overlays and PO/platform-specific exchange still need their own workflow; do not manually maintain a second authoritative copy.

`translations:check` reviews the actual Dutch base and profile/preset catalog files without English fallback. It checks required keys, target-locale plurals, placeholders and missing overlay messages. Text that matches English must have an exact-source terminology review in `translations/unchanged-nl.json`; stale or unused reviews fail. The seed reviews cover borrowed Dutch words, IIIF technical terms and product names, not arbitrary sentences. New or changed source keys require fresh evidence. This gate proves catalog coverage only; migrated callers, natural Dutch wording and state-preserving browser journeys remain separate acceptance requirements.

## Integration status and remaining work

See the [implementation index](implementation/README.md). The next step is the public runtime/bootstrap task, followed by API metadata, shared components/shell, editor/creator forms, presets/plugins and host distributions. Every existing workspace module has a guide, including data/server modules whose correct result may be to remain language-neutral.

Private catalogs are not confidential: shipped strings are visible in browser assets. Published editor/plugin packages must not require this private package at runtime or in their emitted declaration files. Use CI artifact validation for that boundary; a successful workspace typecheck cannot prove it.

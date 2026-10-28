# Manifest Editor internationalisation architecture and migration plan

Research date: 28 October 2026. Repository baseline: `66de064a`. This is an implementation proposal; the accompanying audit is implemented, but application localisation has not been introduced yet.

Use **i18next with react-i18next**, a shared internal catalog package, and an editor-owned runtime instance. Model **locale**, **wording profile**, and **preset** independently. Keep the existing IIIF content-language configuration separate. This gives a host application control over available languages and terminology without coupling the editor to Next.js or changing the IIIF data it edits.

The main alternative is **Lingui** if translator workflow and compiled ICU messages matter more than runtime configurability. **React Intl** is also a strong choice if standard ICU messages and explicit message descriptors are preferred. The library comparison below explains where the other options fit.

## What exists in this repository

The workspace combines Next.js (`apps/web`), Vite integration (`apps/vite-example`), Storybook, separately published React packages, presets, plugins, and a browser distribution. A solution confined to Next.js would miss most of the editor's reusable surface.

| Existing surface | Consequence for localisation |
| --- | --- |
| [`Config.i18n`](../packages/shell/src/ConfigContext/ConfigContext.tsx) has `defaultLanguage`, `availableLanguages`, `advancedLanguageMode`, and text granularity | These configure authored IIIF content. Preserve their behaviour; introduce a separate `uiI18n` configuration. |
| [`AppContext`](../packages/shell/src/AppContext/AppContext.tsx) defines app titles, onboarding, template labels and summaries, preview actions and configuration fields as strings | Support deferred message references in definitions, resolved when displayed. |
| [`Layout.types`](../packages/shell/src/Layout/Layout.types.ts) contains panel/editor definitions | Their labels must update when locale or wording changes, even though definitions are created outside React. |
| [`PluginContext.types`](../packages/shell/src/PluginContext/PluginContext.types.ts) includes plugin metadata and settings fields | Plugins need isolated namespaces and a way to register catalogs when loaded. |
| [`slideshow-preset`](../presets/exhibition-preset/src/presets/slideshow-preset.ts) extends the manifest preset | Preset inheritance must also compose wording overrides explicitly. |
| [`DescriptiveProperties`](../packages/editors/src/definitions/DescriptiveProperties/DescriptiveProperties.tsx) contains visible labels and date-picker ARIA strings | Translating only JSX text will leave accessibility labels and dependency UI in English. |
| [`plugins/translation`](../plugins/translation/README.md) translates IIIF textual content | It is a separate feature, not a UI localisation engine. Its own interface still needs localisation. |
| [`ManifestEditor`](../packages/manifest-editor/src/ManifestEditor.tsx) supports host configuration; packages emit ESM and CommonJS | Configuration must work for embedded editors, multiple editors in one page, and published consumers. |

There is also duplicated UI under `packages/ui`, and some `LegacyManifestEditor` code remains in the web application. Determine reachability before paying to migrate or translate it.

## Open source options and fit

This covers the principal relevant JavaScript/React approaches, rather than every npm translation helper. Ratings are architectural judgments for this repository, not performance measurements. Published bundle-size claims are deliberately excluded: measure the actual integrated editor during the pilot.

| Option | Benefits | Costs and fit here | Verdict |
| --- | --- | --- | --- |
| **i18next + react-i18next** | Framework-independent core; React bindings; namespaces; locale fallback; interpolation/plurals; resources can be supplied or added at runtime; instances support isolated editors. | Requires conventions for IDs, catalog composition and translator metadata. Default global usage would be a mistake in an embedded editor. | **Best overall fit** for host configuration, presets and runtime plugins. [Core API](https://www.i18next.com/overview/api), [React provider](https://react.i18next.com/latest/i18nextprovider). |
| **Lingui** | ICU messages, rich JSX, extraction/validation CLI, PO catalogs, compiled catalogs and deferred messages. | Its normal macro/catalog pipeline needs integration into the repository's tsdown, Next.js, Vite and Storybook paths. Overlays still need project policy. | **Strong second choice**, particularly with professional translators. [Introduction](https://lingui.dev/introduction), [CLI](https://lingui.dev/ref/cli), [monorepo setup](https://lingui.dev/guides/monorepo). |
| **FormatJS / react-intl** | ICU message syntax, React rich-text messages, date/number APIs, explicit descriptors, extraction and compilation tooling. | Runtime catalogs are easy to compose, but namespace ownership and profile fallback are application responsibilities. Typing IDs and argument contracts needs deliberate setup. | **Strong shortlist option** if ICU and descriptor APIs are the priority. [React Intl](https://formatjs.github.io/docs/react-intl/), [CLI](https://formatjs.github.io/docs/tooling/cli/), [API](https://formatjs.github.io/docs/react-intl/api/). |
| **use-intl / next-intl** | `use-intl` provides framework-independent React translations and formatting; `next-intl` adds Next.js routing and server integrations. | Use the core for reusable packages. Choosing `next-intl` throughout would make a Next.js host concern part of the editor API. Catalog overlays remain custom. | **Viable alternative** through `use-intl`; Next.js routing belongs only in `apps/web`. [Core library](https://next-intl.dev/docs/environments/core-library). |
| **Paraglide JS / inlang** | Compiles messages into typed callable modules; offers variants and framework integrations. | Locale switching normally navigates/reloads. Its documented escape hatch requires the application to own reactive updates. Runtime overrides also differ from ordinary mutable catalogs. | **Less natural for this editor**, where unsaved state, independent instances and configurable wording matter. Worth a pilot if generated message functions are preferred. [Basics](https://paraglidejs.com/basics), [variants](https://paraglidejs.com/variants), [multi-tenancy](https://paraglidejs.com/multi-tenancy). |
| **typesafe-i18n** | TypeScript-oriented catalogs, generated types, framework integrations, interpolation and plural support. | A generator becomes another workflow dependency; open-ended third-party catalogs need a deliberate extension contract. The original repository now redirects to `codingcommons/typesafe-i18n`; evaluate that project's current releases before adopting. | **Possible**, but the typing benefits alone do not outweigh the i18next integration fit. [Project](https://github.com/codingcommons/typesafe-i18n). |
| **Fluent / @fluent/react** | Strong language-specific grammar, reusable terms, grammatical attributes and React bindings. Particularly good when translators need structures absent in English. | FTL introduces a different authoring format and requires a typing/extraction strategy. Terminology profiles still need resource composition. | **Specialist option** if grammatical sophistication becomes central. [Fluent](https://projectfluent.org/), [terms](https://github.com/projectfluent/fluent/blob/main/guide/terms.md), [JS packages](https://github.com/projectfluent/fluent.js). |
| **Tolgee React SDK** | React integration, ICU formatter option, in-context translation workflow and static production data; the platform can be self-hosted. | Adds a translation-management workflow decision to the runtime choice. SDK and platform licensing/features should be checked separately. | **Consider when in-context editing is a requirement**; static exports can also accompany another engine. [React setup](https://docs.tolgee.io/js-sdk/6.x.x/integrations/react/installation), [platform integration](https://tolgee.io/apps-integrations/react). |
| **Polyglot.js** | Small API for phrase dictionaries, interpolation and plural selection. | More React integration, rich-message handling, typing and catalog tooling would fall to this project. | **Too little infrastructure** for the scope. [Project and plural syntax](https://github.com/airbnb/polyglot.js). |
| **Rosetta** | Minimal dictionary lookup and interpolation approach. | The project would own most localisation workflow and advanced message requirements. | **Suitable for small tools**, not the preferred foundation here. [Project](https://github.com/lukeed/rosetta). |
| **messageformat / @messageformat/core** | Formatting/compiler primitives for MessageFormat. The current `messageformat` line targets MF2; older ICU-style functionality is available separately. | Not a complete React provider, loading, fallback and extraction solution. MF1/ICU and MF2 are different syntaxes/APIs. | **A building block**, not the editor architecture. [Project documentation](https://messageformat.github.io/). |
| **Globalize** | CLDR-based formatting and message support. | Explicit CLDR-data management and additional React/workflow integration are harder to justify when this application can use `Intl` through a higher-level engine. | **Lower priority** unless advanced CLDR requirements emerge. [Project](https://github.com/globalizejs/globalize). |

`next-i18next` is a Next.js integration in the i18next ecosystem, rather than a replacement for the reusable core. Evaluate it only for web-host integration if needed. [Project](https://github.com/i18next/next-i18next).

Translation management is a separate decision. Start with version-controlled catalogs and reviewed pull requests. If non-developers need an editor, evaluate **Weblate** for a self-hosted, repository-integrated workflow or **Tolgee** for in-context work. Neither is required to ship initial localisation. [Weblate integration](https://docs.weblate.org/en/latest/devel/integration.html).

### Why choose i18next here

The decisive requirement is runtime composition: locale catalogs, preset wording, host overrides and lazily loaded plugin text must work together in an embedded application. i18next exposes the instance and resource APIs required for that, while react-i18next can bind each editor subtree to its own instance. [Instance API](https://www.i18next.com/overview/api), [provider](https://react.i18next.com/latest/i18nextprovider).

Its TypeScript support includes typed selector lookups. Prototype those with the repository's TypeScript 7 toolchain before choosing compiler settings; `enableSelector: "optimize"` changes how plural keys must be handled. Pin tested versions rather than relying on defaults described for future majors. [TypeScript guide](https://www.i18next.com/overview/typescript).

Use the current official **i18next-cli** to evaluate extraction, type generation and linting after calls have been introduced. Keep its generated output apart from hand-maintained terminology overlays, because its extractor owns the configured output files. Its instrumenter is heuristic and plural/interpolated messages still need review. [Official CLI](https://github.com/i18next/i18next-cli).

## Separate the configuration dimensions

| Dimension | Example | Meaning |
| --- | --- | --- |
| UI locale | `en-GB`, `fr`, `cy` | Language, regional conventions and message plural rules. |
| Wording profile | `standard`, `plain`, `institution-leeds` | Alternative terminology or fuller simplified explanations, independently of language. |
| Preset | `manifest`, `collection`, `exhibition-slideshow` | Which workflow and domain-specific meaning apply. |
| Host deployment | a museum installation | Which locale/profile combinations are enabled, defaults, overrides and loaders. |
| Content languages | `en`, `cy`, `none` in IIIF language maps | Languages of the material being authored or displayed. |

An English interface may edit Welsh and French descriptions. Changing the UI to French must not rewrite resource labels, `language` fields, model IDs, IIIF property names or content-language defaults. Machine-translation source/target settings remain independent too.

Treat plain wording as a separate profile rather than inventing a locale such as `en-simple`. Profiles may be translated into multiple languages. A plain profile can change whole instructions, confirmation messages and help, not merely replace nouns. UI feature simplification remains a preset/feature-configuration concern.

### Proposed configuration contract

The following is illustrative API design, not an API that exists today:

```ts
type UiI18nConfig = {
  locale?: string;
  defaultLocale: string;
  availableLocales: readonly string[];
  profile?: string;
  availableProfiles: readonly string[];
  fallbackLocale: string;
  missingTranslations: "fallback" | "report";
};

const config = {
  // Existing content settings keep their existing meaning.
  i18n: {
    defaultLanguage: "cy",
    availableLanguages: ["cy", "en"],
    advancedLanguageMode: true,
  },
  uiI18n: {
    defaultLocale: "en-GB",
    availableLocales: ["en-GB", "cy", "fr"],
    profile: "plain",
    availableProfiles: ["standard", "plain"],
    fallbackLocale: "en-GB",
    missingTranslations: "report",
  },
};
```

Keep executable loaders and supplied catalogs in a runtime `localisation` prop/registration API, separate from configuration that may be persisted as JSON. A locale registry should describe each locale's native display name, text direction, loader, required namespaces and profile availability. Adding an allowed language code alone cannot supply translations.

Locale selection should be deterministic: controlled host selection, then an allowed persisted user choice, then negotiated browser preference, then the configured default. The host allow-list always constrains selection. SSR must start with the same resolved locale/profile/catalogs as hydration; browser preferences can be negotiated client-side later if unavailable on the server. Resolve `fr-CA` to `fr` only when permitted by the deployment. Keep fallback policy explicit.

For each preset, declare required namespaces, default profile and any allowed profile/locale restrictions. Intersect restrictions with host policy; reject an empty intersection during configuration validation. Define availability by **required-message coverage**, not by the presence of a locale directory. Initially allow English fallback with diagnostics; deployments requiring fully localised UI can hide incomplete combinations.

## Shared package and catalog organisation

Use a private workspace package named **`@manifest-editor/languages`** in `internal-packages/languages`. It owns catalogs, overlay data, locale metadata and validation contracts. Source exports can point directly at `.ts` files for workspace development, with `workspace:*` dependencies. No registry publication is necessary for the catalog authoring package itself.

```text
internal-packages/languages/
  package.json                 private: true; explicit subpath exports
  src/
    schema.ts                  message and placeholder contracts
    registry.ts                supported locale/profile metadata
    locales/
      en-GB/
        common.ts
        shell.ts
        editors.ts
        creators.ts
        manifest.ts
        collection.ts
        exhibition.ts
      cy/...
      fr/...
    profiles/
      plain/en-GB/editors.ts
      plain/cy/editors.ts
    presets/
      exhibition/en-GB/editors.ts
      exhibition/plain/en-GB/editors.ts
    translator-notes/...
```

Prefer **one physical file per locale and namespace**, and subpath imports such as `@manifest-editor/languages/locales/en-GB/editors`. Avoid a root barrel importing every language. A namespace is a feature/domain boundary, not a language or a profile. First-party plugin catalogs can use `plugin-translation`, `plugin-annotations`, etc.; third-party plugins own and register their own catalogs.

Start with TypeScript source catalogs for English and typed overlay objects. Export/import JSON for translators when useful; choose one authoritative source per catalog and generate the other representation. Do not maintain TS and JSON copies manually. If a translation platform becomes authoritative, generate types from its exported files instead.

### Internal source imports and public packages

**A private package is an authoring boundary, not a secrecy boundary.** Shipped UI strings are visible in browser assets. Public npm packages must not contain an unresolved dependency on an unpublished private package, and raw TypeScript should not leak into their runtime exports or declaration imports.

For the production implementation:

1. Bundle the private catalog data into each owning published feature package, or generate JS catalog assets before packaging. With the current tsdown setup, explicitly configure and verify catalog inlining; do not assume workspace dependencies are automatically bundled.
2. Give optional locale chunks explicit public export paths in the owning package or a separately published language-pack package. The app can also supply its own loaders. Only advertised built-in languages need built-in loaders.
3. Put the shared React runtime/provider/hook contract in a small published **`@manifest-editor/i18n`** package, re-exported through `manifest-editor` where helpful. It depends on the chosen engine and has no dependency on `shell` or presets. It is the common dependency of UI packages; catalog authoring remains private.
4. Keep this runtime external to independently published package bundles. Internal and external plugins must resolve the same React context/provider module. Inlining a provider implementation into every package risks disconnected contexts; bundling catalog **data** is safe.
5. Keep public declarations self-contained: public message-reference and registration types belong to the runtime package, not the private catalog package. Cover ESM, CommonJS, browser runtime and plugin entry points in later package validation.

If adding another public package is undesirable, expose the same shared runtime through a stable low-level package such as `components`, after checking its dependency graph. Do not place it only in `shell` if that would create cycles for components and creator/editor APIs. Direct TS imports are a good internal convenience; they do not solve the published-consumer boundary.

## How to define and use messages

Use stable semantic IDs by domain and intent: `editors:canvas.add`, `editors:canvas.removeConfirm`, `shell:project.open`, `exhibition:tourStep.empty`. Keep IDs independent of the current English wording and file names. Share truly common actions such as `common:actions.cancel`; do not merge distinct concepts solely because the English text matches.

```ts
// Base catalog; a plain profile can override these same semantic keys.
export const editors = {
  canvas: {
    add: "Add canvas",
    removeConfirm: "Remove this canvas from the manifest?",
    count_one: "{{count}} canvas",
    count_other: "{{count}} canvases",
  },
} as const;

export const plainEditors = {
  canvas: {
    add: "Add page",
    removeConfirm: "Remove this page from the item?",
    count_one: "{{count}} page",
    count_other: "{{count}} pages",
  },
};
```

Base catalogs should be complete against the namespace schema. Overlays are validated deep partials whose leaf types are `string`, rather than literal English values. Validate interpolation names and rich-text placeholders separately. Plural completeness must follow each locale's categories, rather than demanding exactly English's `_one` and `_other`. i18next's plural selection requires the `count` option. [Plural documentation](https://www.i18next.com/translation-function/plurals).

React components resolve messages through an instance-bound hook at render time. With typed selectors, a simple lookup can be `t($ => $.canvas.add)` after selecting the `editors` namespace. Use `<Trans>` for messages containing React links/emphasis and translate complete sentences. Do not construct plurals with `count === 1 ? "" : "s"`, build sentences by concatenation, or translate user content with the UI lookup function.

For module-level definitions, add optional references alongside existing string fields during migration:

```ts
const canvasPanel = {
  id: "current-canvas",                  // Stable, untranslated identifier.
  label: "Current canvas",               // Compatibility fallback.
  labelMessage: {
    namespace: "manifest",
    key: "panels.currentCanvas",
  },
  // Existing icon/render fields remain as before.
};
```

Resolve `labelMessage` in the UI that consumes the definition; fall back to `label` for old plugins. Apply the same pattern to descriptions, placeholders, template summaries, creator options, validation errors and preview actions. This avoids an immediate breaking change to every public `label: string` contract. A descriptor helper may improve typing, but the extractor must recognise it. Never call a global translator during module import: the resulting English string would remain cached after locale changes.

Background actions should receive an instance-bound formatter through their runtime context. For history that should retranslate, persist a message descriptor plus serialisable values and a readable fallback. Keep diagnostic logs and externally supplied errors as explicit separate cases; avoid storing React nodes or translating machine-readable status codes.

### Terminology and grammar

For short labels, a glossary helps translators keep `Canvas`, `Manifest`, `Range` and `Slide` consistent. For sentences, override whole messages. Replacing every occurrence of `Canvas` with `Page` or injecting a translated noun into a generic `Delete {{thing}}` string fails for languages with grammatical gender, inflection or different word order. A profile needs messages for confirmations, instructions, counts, tooltips and accessibility labels too.

Exhibition-specific messages should generally live in `exhibition`; an overlay on a shared `editors` key is appropriate only when the **same action and meaning** need preset wording. A slide and a page are not interchangeable throughout the interface simply because both use a IIIF Canvas internally.

## Override and fallback rules

Implement composition as a small pure function before handing catalogs to the engine. Do not encode every preset/profile combination as an i18next language, and do not depend on lookup namespace ordering to define institutional policy. Native i18next locale fallback is useful, but it does not define the application's full overlay semantics. [Fallback guide](https://www.i18next.com/principles/fallback).

For **each locale independently**, merge from lowest to highest priority:

1. Base namespace catalog.
2. Inherited preset overlays, then the selected child preset overlay.
3. Selected wording-profile overlay.
4. Preset-and-profile intersection overlay, when needed.
5. Host deployment override.

Then resolve missing keys through the configured locale chain, for example `fr-CA → fr → en-GB`. Do not merge the English fallback into the French resource object first: a missing French message containing a count would then risk being formatted using French plural rules even though the text is English. Keep resources per locale and let the engine perform language fallback.

This policy means a plain-profile message can override inherited preset text. Where a preset needs a different plain wording, its intersection overlay wins. Verify this rule with a fixture where all layers set the same key; it is a product policy and should not be implicit.

Overlay objects contain message strings, not arrays. Missing keys inherit; `null` is rejected and `undefined` means absent. Decide explicitly whether an empty string is valid for a given key; required labels should not be blanked accidentally. Validate keys, placeholders and message syntax at registration time for runtime catalogs. Rebuild resources from immutable layers on profile/preset change; incrementally merging into an old instance can leave stale overrides behind.

On locale/profile changes, load all required catalogs, compose a complete resource snapshot, then commit the selection. Prevent a slow previous request from replacing a later selection. Keep the current UI while loading, and recover to it if loading fails. Do not remount the editor or lose its vault, undo history or unsaved form state.

Plugin registrations own their namespace and loaders. Plugin-to-plugin namespace collisions are errors; plugins do not silently overwrite core namespaces. Host overrides can deliberately target registered plugin messages. External plugin typing should support local augmentation/registration, rather than requiring every plugin to be compiled into a central union of keys.

## Localisation includes layout and dependency UI

Set `lang` and `dir` on the editor root; let a full-page host also set document attributes. An embedded editor must not change the entire host document's language. Portals, menus, dialogs and tooltips need the same provider and direction, even if mounted outside the root DOM element.

Use `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.ListFormat`, relative-time and display-name formatting with the selected UI locale. Define time-zone behaviour explicitly for dates. Preserve machine formats for IIIF IDs, temporal selectors, CSS dimensions, exports and transport data; a `toFixed` call is a review point, not automatically a localisation bug.

Review date/time pickers, rich-text toolbars, IIIF browsers/viewers, React Aria integration, validation widgets and loading/error boundaries. Some third-party libraries have their own locale providers or bundles; others require translated props. `plugins/translation/src/languages.ts` contains 100 English language names: consider `Intl.DisplayNames` plus curated fallbacks/native names instead of manually translating that list into every locale.

Audit logical CSS properties, directional icons, panel order and keyboard expectations for RTL; do not mirror actual image/canvas coordinates. Include long translations, narrow viewports, screen-reader names and a pseudo-locale in acceptance testing. Accessibility strings are part of required coverage.

## Measured migration scope

The repeatable [scope audit](internationalisation-audit.md) scans JavaScript/TypeScript source with Oxc. At this baseline it found:

| Measure | Count |
| --- | ---: |
| Files scanned | 1,024 |
| Files containing candidates | 414 |
| Candidate occurrences | 2,893 |
| Distinct candidate texts | 2,046 |
| Candidate occurrences outside `LegacyManifestEditor` | 2,834 |
| Module-definition candidates | 585 |
| Mixed-JSX candidates | 716 |
| Interpolated templates | 148 |
| Terminology-related candidates | 534 |
| Parse errors | 0 |

Flags overlap. The largest areas are exhibition preset (573), manifest preset (440), shared editors (400), web app (326), translation plugin (216), shell (208) and UI package (184). The first three account for about 49% of occurrences.

These are candidate edit sites, not final message IDs or confirmed active UI. The scan omits tests, Storybook, Playwright and tutorial/example code by default. It does not follow imports to prove reachability, inspect dependency UI or extract MDX/JSON/CSS strings. It also skips known translated calls/components, imports and types. Authored defaults, developer errors and static language-name lists require review. One mixed JSX sentence may produce several candidate fragments that should become a single message; the same English text can also require several semantically distinct IDs.

### Effort scenarios

Use a pilot to replace the following **planning assumptions**, not as a delivery commitment. Engineering-day calculations assume eight hours; translation and linguistic review are additional work.

| Work | Initial allowance |
| --- | --- |
| Representative pilot and final library decision | 2–3 engineering days |
| Shared runtime, catalogs, layering, configuration and plugin/definition contracts | 5–8 days |
| Candidate review and migration | `accepted edit sites × average minutes per site / 480` days |
| Integration QA, dependency locales, accessibility, initial RTL review and packaging | 4–7 days |

Using all 2,834 non-legacy sites as a provisional workload gives **11.8–35.4 days** at 2–6 minutes per site. Adding the other allowances gives approximately **23–53 engineering days** for broad migration. The low end assumes assisted mechanical edits and few structural changes; the high end allows more message redesign. Some candidates will be rejected, while missed and third-party strings add work. Measure the accepted fraction and time spent on simple versus complex cases in the pilot before scheduling the rest.

A narrower first release—shared runtime, one preset and its necessary shared controls—is a smaller project than repository-wide coverage. Do not advertise another preset as translated solely because it inherits translated shell text.

For language costs, measure words in the reviewed catalog, excluding repeated occurrences, placeholders and generated language names. Obtain translator estimates from that word count and separately count profile-specific messages. Raw English-string deduplication is not an adequate pricing basis.

## Plan of attack

### Phase 1 Establish the baseline and prove the design

Run the audit, sample 50–100 candidates across high- and low-complexity files, and decide which legacy/duplicate surfaces are supported. Agree the English glossary and the first plain wording profile with someone who knows the target audience.

Prototype i18next in a small branch with a panel label, descriptive-property form, plural count, rich message, plugin settings form and exhibition wording override. Use English and one real second language, plus a pseudo-locale. Verify two embedded editors with different settings and a switch while an unsaved form is open. Exercise one inherited-preset/profile collision. Use these results to confirm the choice against Lingui or React Intl if the workflow feels wrong.

**Exit:** proven configuration and instance isolation; measured migration rate; agreed supported scope; a tested major version/toolchain combination.

### Phase 2 Build the shared foundation

Create the private language package and public runtime boundary. Add typed namespaces, validation, loader registry and pure composition. Add `uiI18n` alongside content `i18n`; define `mergeConfig` behaviour for both without changing existing saved configurations. Introduce deferred references alongside string fields in app, preset, panel, editor, creator, plugin and background-action contracts.

Provide one default English locale so existing hosts and third-party plugins continue to work. Expose optional language loading and host catalogs through runtime configuration. Document preset inheritance, restrictions and override priority.

**Exit:** English behaviour preserved, missing registrations diagnosed, deterministic overlays, no private dependency or duplicate provider in package outputs when packaging validation is performed.

### Phase 3 Migrate a complete user journey

Migrate shell navigation and shared actions, descriptive editors and creators, then the manifest preset's opening/editing/saving journey. Resolve static definitions at display time. Include validation, empty/loading states, confirmations, ARIA strings, background-action results and dependency widgets.

Add extraction/checking for the chosen message API. Keep translator notes explaining the object/action, variables, rich-text placeholders, and where simplified wording differs. Begin reporting newly introduced hardcoded UI text; ratchet coverage by migrated area rather than making every legacy string a blocker immediately.

**Exit:** one complete preset is usable in the second language and plain wording; a language switch preserves editing state and leaves content unchanged.

### Phase 4 Cover the remaining supported features

Migrate collection and exhibition workflows, then enabled plugins and their settings. Exhibition should receive its own terminology review rather than a blanket Canvas-to-Slide substitution. Migrate active web-host settings/tutorials separately from the reusable editor. Remove or explicitly defer dormant duplicates after reachability review.

**Exit:** each supported preset declares required namespaces and accurate locale/profile availability. Runtime-loaded plugins follow the same validation and isolation rules.

### Phase 5 Validate and release

Test locale fallback and layer precedence; complete plural forms for actual target locales; missing/invalid runtime messages; asynchronous switching races; simultaneous editors; SSR/hydration; portals; state preservation; and unchanged IIIF exports. Run existing application checks appropriate to the changes, with pseudo-locale and actual RTL review where RTL is advertised.

For packaging, verify built npm tarballs resolve without private workspace packages, that declarations expose public types, optional locale chunks load under Next.js/Vite/browser distributions, and that separately installed plugins share the provider. Add translation completeness/placeholder checks to CI and ensure fallback diagnostics do not expose user content.

**Exit:** advertised combinations meet their coverage policy; packaging and accessibility verified; translation update and contributor workflows documented.

## Using the audit script

```sh
# Human-readable summary; no output files written.
pnpm audit:i18n

# Full per-occurrence locations and flags, plus a reviewable summary.
pnpm audit:i18n --json /tmp/i18n-audit.json --markdown docs/internationalisation-audit.md

# Concentrate on a feature or first-release scope.
pnpm audit:i18n --scope packages/shell --scope packages/editors --scope presets/manifest-preset

# Broader supporting-source inventory. MDX/Markdown are still excluded.
pnpm audit:i18n --include-tests --include-docs

# Machine-readable stdout without pnpm's script wrapper.
node scripts/audit-i18n.mjs --json - > /tmp/i18n-audit.json

# Regression checks for the inventory logic.
pnpm test:audit-i18n
```

The JSON contains workspace/file rankings, repeated texts, candidate locations and flags, formatting/content-language review points and parse failures. Parse failures and missing scopes cause a non-zero exit so an apparently small report cannot conceal an incomplete scan. Output is deterministic for the same files and revision. Re-run it during migration, but use catalog validation—not declining candidate counts—as the eventual translation-completeness gate.

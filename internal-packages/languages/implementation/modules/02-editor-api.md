# Editor API display metadata

Status: Data-layer metadata and EN/NL catalogs complete; pending consumer integration and release declaration checks. Module: [`packages/editor-api`](../../../../packages/editor-api).

Make property documentation, resource names, behavior labels and canvas-layout choices localisable without changing editing semantics.

## Prerequisites

- [Public i18n runtime and workspace bootstrap](01-public-runtime.md).

Namespace ownership: **editor-api**. [Source inventory](../inventories/02-editor-api.md)

## Files and surfaces to inspect

- `packages/editor-api/src/meta`
- `packages/editor-api/src/canvas-layout/geometry.ts`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Review meta/documentation, meta/behavior, meta/rights and canvas-layout/geometry against the inventory. Separate official terminology/documentation from UI hints; retain attribution and documentation URLs.

2. Add optional message references alongside display strings in API definition contracts. Keep the fallback strings available to existing consumers until they resolve references.

3. Represent displayed behavior and resource labels as UI descriptors even where current code uses InternationalString; do not repurpose user-authored IIIF language maps as catalogs.

4. Move reviewed display messages into the editor-api namespace and add plain explanations where property labels such as navDate require them.

5. Keep identifiers, IIIF property keys, geometry IDs, behavior values, rights URIs and numeric coordinate calculations stable.

## Acceptance checks

- [x] Metadata getters and mutation APIs produce unchanged IIIF output (targeted Vault and composition tests).
- [x] A static geometry/behavior definition resolves different display text after a locale change (real runtime test).
- [ ] Public declaration files have no dependency on the private language package.

## Boundaries

No React provider belongs in the editing API; translate only the display boundary.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.

## Implementation evidence — 28 October 2026

Data-layer migration complete; consuming UI migration remains with modules 05/06 and preset owners. Both `en-GB` and `nl` now contain **147 reviewed messages** in `editor-api`: 39 property labels, 9 resource labels, 42 complete specification summaries plus attribution, 9 behavior group labels, 16 behavior values, 14 rights labels/descriptions, 13 layouts and 4 size choices. Dutch supplies actual translations for every key; no fallback-only coverage. No new plural/interpolation messages are needed: fixed layout quantities are translated as whole labels, including their dimensions.

### Published contracts and reference map

All exports below are available from `@manifest-editor/editor-api` (also from the source `meta` barrel where applicable). No dependency/lockfile changes were needed.

- `DisplayMessageReference` is an explicit serialisable public interface, structurally compatible in both directions with `@manifest-editor/i18n`'s `MessageReference`: `namespace`, `key`, optional primitive `values` and `defaultValue`. It imports neither React nor the runtime nor private language authoring types. `DisplayLabel` has existing `label: string` plus optional `labelMessage`.
- `propertyLabels[property]` is a typed companion table keyed by unchanged IIIF identifiers (`DisplayProperty` is its key union). Its `labelMessage` maps to `fields.<property>`. Covers all properties in all resource support tables, reference properties, `navPlace`, `textGranularity`, and textual body `value`.
- `resourceLabels[type]` is checked against `AllResourceTypes`. Its keys are unchanged IIIF type names; catalog keys are `resources.manifest`, `canvas`, `range`, `collection`, `annotation`, `annotationPage`, `annotationCollection`, `contentResource`, `agent`. These are system type names, never authored resource titles.
- Exported `DocDefinition` retains `link` and `summary` and adds optional `summaryMessage`. `documentation.{definedTypes,descriptive,technical,linking,structural}[identifier]` maps to `documentation.<section>.<identifier>`. All 42 original English summaries are copied in full, including the originally truncated `type` sentence; links, attribution, disclaimer, licence and version remain intact. `documentation.attributionMessage` maps to `documentation.attribution`.
- `BehaviorChoice` and each choice item gain optional `labelMessage`, without changing `InternationalString` labels. Group keys are `behavior.groups.{autoAdvance,repeat,manifestOrdering,canvasOrdering,collection,range,collectionOrdering,rangeOrdering,hidden}`. Item keys are `behavior.values.<unchanged-protocol-value>`. English catalogs give readable semantic labels for raw protocol-token fallbacks, e.g. `no-auto-advance` → “No auto-advance”; Dutch gives “Niet automatisch doorgaan”. Existing group IDs (including the shared `@iiif/range` ID) are preserved. `BehaviorEditor.getSupported()` exposes these references directly.
- Exported `CCDefinition` retains every field and adds optional `labelMessage` / `descriptionMessage`. `creativeCommons` and `RightsStatementEditor.getOptions()` / `getDefinition()` expose `rights.<name>.{label,description}`, with names `publicDomain`, `attribution`, `attributionShareAlike`, `attributionNoDerivs`, `attributionNonCommercial`, `attributionNonCommercialShareAlike`, `attributionNonCommercialNoDerivs`. Abbreviations such as `CC BY-SA`, icons and all value/documentation/legal URIs stay unchanged.
- `CanvasLayout` gains optional `labelMessage`. Layout ID → catalog suffix: `pair` → `pair`, `triptych` → `triptych`, `feature-left` → `featureLeft`, `feature-top` → `featureAbove`, `grid-four` → `fourImages`, `grid-six` → `sixImages`, `hero-inset` → `heroInset`, `offset-pair` → `offsetPair`, `cascade` → `cascade`, `stack-right` → `stacked`, `scatter` → `scatter`, `gallery` → `galleryWall`, `blank` → `blank`, under `layout`.
- Exported `CanvasSizePreset` types `canvasSizePresets`, keeping `label`, `columns`, `rows` and adding optional `labelMessage` with `sizes.{landscape,wide,square,portrait}`. No geometry number, position, slot, resource ID, editing payload, or worker transport changed.

Example for render-time consumers (inside the existing provider):

```tsx
const { resolveMessage } = useEditorI18n();
const field = propertyLabels.navDate;
const label = resolveMessage(field.labelMessage, field.label);
const help = documentation.descriptive.navDate;
const summary = resolveMessage(help.summaryMessage, help.summary);
// Same pattern for a layout or rights definition.
```

A worker may carry the plain descriptor and fallback to the display boundary; it must not invoke client-bound factories at module import. Non-React consumers with an instance can call `instance.resolveMessage(reference, fallback)` when presenting a result. Keep the source descriptor, rather than caching resolved text, so locale/profile changes re-resolve it.

For behavior groups/items only, the legacy fallback is an `InternationalString`: branch on `labelMessage`, resolve it with the runtime when present, and otherwise use the existing `LocaleString` display. Do not send the map itself to `resolveMessage`. Third-party definitions can omit every new reference. Do not apply these lookups to resources' authored labels, metadata or summaries.

### Full source review and consumer follow-up

Reviewed the entire `packages/editor-api/src` tree and complete inventory, beyond the heuristic seeds. Metadata support arrays and reference/property lists contain protocol identifiers, not UI copy. `RequiredStatementEditor`, `InternationalStringEditor`, `MetadataEditor` and descriptive editor values are authored content and remain untouched. All mutation, observer/tracker and composition code remains unchanged.

The inventory's `BaseReferenceListEditor` (“Cannot set directly”, unimplemented operations), `ReadonlyProperty` (“Read only”), geometry dimension checks and layout-capacity error are developer/invariant errors, not display definitions. `EditorInstance` validation exceptions and `RangeReferenceListEditor` console diagnostics retain their external error details; this task does not translate arbitrary exceptions, validator-supplied messages or logs. The test fixture label “Image” is authored fixture data, not a catalog key. Hex colours, MIME types, IDs, behavior values, language codes and coordinates remain machine data.

Exact consumer work, deliberately outside this module:

- `packages/editors/src/components/CanvasLayout/{CanvasLayoutForm,CanvasImageMode}.tsx`: resolve each layout/size `labelMessage` at render time; keep IDs, index selection and dimensions unchanged.
- `packages/editors/src/definitions/TechnicalProperties/TechnicalProperties.tsx` receives API choices via `behavior.getSupported()`. `components/BehaviorEditor/BehaviorEditor.types.ts` duplicates the choice contracts and must retain the optional references (or reuse the API contract). `BehaviorEditor.tsx` and `BehaviorEditor.utils.tsx` must render group/item references; custom definitions still use `LocaleString` and authored/custom behavior input remains raw.
- `packages/editors/src/definitions/DescriptiveProperties/DescriptiveProperties.tsx`: use `propertyLabels` for system field names, particularly `navDate`, and use its full documentation summary for help. Current rights datalist only shows URIs; any future rights picker can use `getOptions()` metadata without changing its saved value.
- Shell, editor help and preset type pickers should use `resourceLabels` and `documentation` references when they display system names/help. No current shell import consumes these documentation definitions. Avoid passing authored `InternationalString` titles through the UI translator.

Supported catalog coverage is standard `en-GB` and `nl`. There are no editor-api-specific plain overlays; a plain profile inherits these base messages. This does not claim complete plain-language copy or migrated consumer rendering. Runtime namespace registration maps and shared inventory/index files were not changed.

### Checks actually run

- `pnpm install --ignore-scripts --frozen-lockfile`: succeeded; lockfile unchanged; no lifecycle/build hooks.
- `node packages/i18n/node_modules/vitest/vitest.mjs run --config packages/editor-api/vitest.config.ts`: **27 passed** across metadata and existing canvas-layout suites. The package config resolves editor-api source for creator-api's integration import, without package outputs/builds. Covers complete EN/NL contracts, all reference mappings/full English fallback copy, serialisability, static metadata resolving Dutch after selection, old third-party definitions, real Vault edits and unchanged authored multilingual labels/exports after a locale switch. Existing geometry tests exercise editing/composition capture and restore, layout positions and IIIF-only export. No whole-editor undo/worker/browser claim is made.
- `node --test internal-packages/languages/test/*.test.mjs`: **60 passed**, including Dutch coverage, placeholder and locale plural validation.
- `pnpm exec tsc --noEmit -p internal-packages/languages/tsconfig.json`: passed.
- `pnpm exec tsc --ignoreConfig --noEmit --moduleResolution bundler --module esnext --target ES2022 --skipLibCheck` with the six changed metadata/geometry source files: passed. The same command with `packages/editor-api/tests/display-contract.types.ts`: passed, checking public `MessageReference` compatibility in both directions and legacy third-party definitions.
- Targeted `oxlint` on editor-api source, added tests/config and both owned catalogs: passed. `oxfmt` on changed TS files and `git diff --check`: passed.
- Self-review compared every non-function data export in documentation, rights, behavior and geometry to `git show HEAD:<path>` using Node’s TypeScript stripping and deep equality after removing only `*Message` fields: all existing fallback strings, protocol values, URLs and numeric metadata matched exactly.
- Full `pnpm exec tsc --noEmit -p packages/editor-api/tsconfig.json`: blocked by pre-existing **TS2425**, `EditorInstance.ts:99` overriding `BaseEditor.ref` property with a method. Both files are unchanged; no new metadata diagnostics.

Source contracts are free of unpublished imports and runtime/client calls. Emitted declaration/tarball validation remains a release check because package builds are prohibited. Parent owns integrated browser checks on its main checkout; no server was started/stopped and this worktree did not test against unrelated running source.

## Parent catalog review

The strict Dutch translation gate reviewed the expanded catalog individually: `homepage` is displayed as “Webpagina” and the cascade layout as “Trapsgewijs”. Exact-source reviews retain the Dutch cognates Metadata, Type, Logo and Items, and the technical IIIF term Range. This records deliberate terminology choices rather than accepting English fallback.

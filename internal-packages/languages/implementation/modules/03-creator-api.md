# Creator API message contracts

Status: **API implementation complete; downstream display integration pending.** Module: [`packages/creator-api`](../../../../packages/creator-api). Reviewed against foundation plus Dutch seed baseline `3759ec23` on 28 October 2026.

Namespace ownership: **creator-api**. [Source inventory](../inventories/03-creator-api.md). Prerequisite: [public runtime](01-public-runtime.md).

## Completed contracts

- `CreatorDisplayMessages` supplies optional `labelMessage`, `summaryMessage`, `helpMessage`, and `placeholderMessage` on both `SpecificCreatorDefinition` and `CreatorConfigField`. Existing `label: string` remains required; summary/fallback fields retain their types. Help/placeholder references can carry `defaultValue`; checkbox fields do not acquire input/placeholder behavior.
- Definitions also accept `actionButtonMessage`. IDs, config keys, field IDs, tags, static fields, options, initial data, probe data and authored InternationalString values are unaffected.
- `CreatorValidationMessage` is a serialisable `{ code?, field?, message: MessageReference }`. Codes and field IDs are machine data. Only `message` is UI text; primitive interpolation values survive JSON and structured clone.
- Optional `validationErrorMessage(error: unknown, context: CreatorValidationContext<Payload>)` returns that feedback or `undefined`. Context contains the original `payload` and `vault`; it is local input, not serialisable transport. The mapper is synchronous and consumers invoke it at an existing catch boundary. It does not change `validate(payload, vault): void | Promise<void>`, render-context boolean validation, error identity, or runtime execution. Unknown errors use the consumer's normal fallback.
- Optional `CreatorContext.i18n?: Pick<EditorI18n, "resolveMessage">` lets shell supply its instance formatter to custom forms. `withInitialData` and `withCustomRender` preserve the context/reference metadata. This callback stays in the UI; never persist it or add it to payloads, CreatorOptions, generated resources or workers. The headless creation context is unchanged because it has no current display consumer.
- Public types are imported **type-only** from `@manifest-editor/i18n`; definitions use plain objects. No provider, factory call, runtime React import, global locale state, private catalog import or runtime formatter was added. The public i18n dependency is declared for declaration consumers. Source typechecking enables `.ts` imports used by the workspace i18n package. Added Vitest only as a development dependency; lockfile edits are restricted to this importer.

## Downstream API examples

These examples use hypothetical third-party namespace `example-creators`; register its reviewed catalogs in the host. They do not introduce shipped creator-api messages.

```ts
import type { CreatorConfigField, CreatorValidationMessage } from "@manifest-editor/creator-api";
import { defineCreator } from "@manifest-editor/creator-api";

const definition = defineCreator({
  id: "example/blank", // stable ID, never translated
  label: "Blank canvas",
  labelMessage: {
    namespace: "example-creators", key: "blank.label", defaultValue: "Blank canvas",
  },
  summary: "Create an empty canvas.",
  summaryMessage: { namespace: "example-creators", key: "blank.summary" },
  helpMessage: {
    namespace: "example-creators", key: "blank.help", defaultValue: "Enter a title.",
  },
  placeholderMessage: {
    namespace: "example-creators", key: "blank.placeholder", defaultValue: "Canvas title",
  },
  actionButton: "Create",
  actionButtonMessage: { namespace: "example-creators", key: "blank.create" },
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label"],
  supports: {},
  create(payload: { title: string }, ctx) {
    // This is authored content. UI locale must not choose or rewrite its language.
    return { id: ctx.generateId("canvas"), type: "Canvas", label: { cy: [payload.title] } };
  },
  validationErrorMessage(error, { payload, vault }) {
    if (!(error instanceof RangeError)) return undefined;
    return {
      code: "title-too-short", field: "title",
      message: {
        namespace: "example-creators", key: "title.minimum",
        values: { count: 2 }, defaultValue: "Enter at least {{count}} characters",
      },
    } satisfies CreatorValidationMessage;
  },
});

const field: CreatorConfigField = {
  id: "enabled", type: "checkbox", label: "Enabled",
  labelMessage: { namespace: "example-creators", key: "enabled.label" },
  defaultValue: true,
};
```

At display time, shell can call `runtime.resolveMessage(definition.labelMessage, definition.label)` and likewise summary/action/field references. Gate optional summary/help display on the **resolved text or reference**, not just the legacy summary string. Form injection: `i18n: { resolveMessage: runtime.resolveMessage }`, where `runtime` is the current editor instance. Keep these lookups reactive to locale/profile changes without recreating creator definitions or remounting forms.

At the existing creation catch boundary:

```ts
const feedback = definition.validationErrorMessage?.(error, { payload, vault });
// Store feedback rather than formatted text so a locale switch can re-resolve it.
const text = feedback
  ? runtime.resolveMessage(feedback.message, legacyErrorText)
  : legacyErrorText;
```

The mapper must recognise its own errors, return undefined for unknown failures, and avoid exposing raw payload values unnecessarily. Preserve any machine code separately. Do not make legacy `validate` return descriptors or silently begin invoking it: `CreatorRuntime.run` currently calls `create` directly.

## Actual consumers and precise follow-up

Read-only trace (no edits outside this module):

- `packages/shell/src/BaseCreator/BaseCreator.tsx`: `BaseCreator` maps `item.label`/`item.summary` into `CreatorGrid` title/description. Resolve both here; `packages/components/src/CreatorGrid.tsx` should continue receiving display strings. `RenderCreator` displays `actionButton`, summary/help tooltip and the creator label in the help accessible name. Resolve there and inject optional `i18n` in the `creator.render({...})` context. `runCreate` catches creation failures and currently stores `err.message || "Unknown error"` as a string; this is the concrete consumer for `validationErrorMessage`. Store descriptors and resolve at render time. Its local `validate` currently returns true and does not call definition validation; preserving that behavior is intentional in this API-only task.
- `packages/shell/src/ConfigContext/CreatorSettings.tsx`: resolve definition and checkbox label/summary at render time. `CreatorSettings.helpers.ts` deduplicates by `getCreatorConfigKey`; retain that identity and FormData field names. This module has no settings heading of its own.
- `packages/creators/src/ContentResource/IIIFBrowserCreator/index.tsx`: owns the real configuration field `addManifestMetadataToCanvas` and its label/summary. Module 08 should supply references plus full English/Dutch messages in **creators** for this setting and other creator definitions/forms. Help and placeholders inside forms belong there; no generic form schema is introduced here.
- `packages/creators/src/ContentResource/image-service-options.ts`: `includeSizes`/`includeTiles` are configuration data used to compact IIIF services, not UI display fields in creator-api. Do not translate these keys or alter service payloads. The pre-existing `creator-api.settings.{title,includeSizes,includeTiles}` English/Dutch seed entries are retained unchanged; they are not evidence of a migrated consumer and no duplicate form wording is added.
- `CreatorResource.warnings/errors` are existing string arrays with no current in-repository feedback renderer/writer found. Leave them unchanged rather than widening payload/error contracts without a consumer. `CreatorResourceProbeResult.label` is unconsumed by the picker and may describe remote content; leave it as a string.

## Whole-module classification

All ten `src` files were reviewed, beyond the eight heuristic candidates:

- `Creator.ts`: all six inventory messages (missing definition; unsupported parent type, field, map and custom support; invalid placeholder position) are technical guard failures. Preserve exact exception strings and throw behavior. Shell needs a localised generic fallback for unknown/technical failures; module 03 does not translate internal diagnostics automatically.
- `CreatorInstance.ts`: missing nested creator/config is a technical failure. `generateId` path segments, `unknown`/`none` types and selector values are identifiers/protocol data. No extraction.
- `CreatorRuntime.ts`: “Creator has not been run” is a lifecycle/programmer error. Deduplication, create invocation, actions and commit remain untouched.
- `CreatorResource.ts`, `ReferencedResource.ts`, `utils.ts`, `placeholder-position.ts`: resource defaults, parser types, random IDs, reference data, metadata, placement geometry and `xywh` selector serialization are IIIF/technical data. No display lookup or language change.
- `types.ts`, `creator-register.ts`, `index.ts`: API definitions and identity-preserving wrappers. Additive types only; wrapper implementations/exports already preserve and export the new metadata.

**New shipped semantic IDs: none. New required namespaces: none.** Existing English and complete Dutch seed catalogs are unchanged. This is an API completion, not a claim of complete Dutch creator UI or plain-profile coverage. Module 08 and shell own that integration.

## Acceptance evidence and remaining checks

- [x] Existing definitions, checkbox config fields and render contexts remain assignable with no new members. Literal creator IDs and inferred payloads are checked in `test/messages.test.ts`.
- [x] Feedback JSON/structured-clone round trips retain primitive placeholder values; known errors map and unknown errors return undefined.
- [x] Wrapper regression covers initial-data merge precedence, invocation data preservation, message references and optional instance formatter.
- [x] Real Vault creation regression preserves Welsh authored label, payload identity, generated ID shape, no descriptor leakage, and the current non-invocation of validation/mapping. Creation failure retains original error identity.
- [x] Direct Node Vitest: five tests pass; source aliases resolve editor-api without building it. Targeted oxlint and formatting checks pass (commands recorded below).
- [ ] Full typecheck is blocked by existing dependent-source errors: `packages/editor-api/src/EditorInstance.ts:99` TS2425 (`ref` property/method), and `packages/i18n/src/I18nProvider.tsx:92` TS2322 (`components` prop). The source-mapped contract/test check reports these two errors and no creator-api/test errors. Independent `tsc --noEmit` checks of i18n and editor-api reproduce their respective errors without creator-api in the check. Ordinary package typecheck also requires unbuilt editor-api declarations, so no passing package/declaration claim is made.
- [ ] Parent owns integrated browser checks and downstream resolution/state-switching tests; no worktree browser test assumes the running parent server contains these changes. Publication/declaration packaging remains module 29; no build/prepack was run.

Checks from repository root using Node 24:

```sh
node packages/creator-api/node_modules/vitest/vitest.mjs run --config packages/creator-api/vitest.config.ts
node node_modules/typescript/bin/tsc --noEmit -p packages/creator-api/tsconfig.test.json
node node_modules/oxlint/bin/oxlint packages/creator-api/src/types.ts packages/creator-api/test packages/creator-api/vitest.config.ts
node node_modules/oxfmt/bin/oxfmt --check packages/creator-api/src/types.ts packages/creator-api/test/messages.test.ts packages/creator-api/vitest.config.ts packages/creator-api/tsconfig.json packages/creator-api/tsconfig.test.json packages/creator-api/package.json
```

Tooling note: initial filtered dependency installation used `--ignore-scripts`. A subsequent `pnpm exec` unexpectedly triggered an automatic full-workspace install and ran dependency lifecycle hooks (including root prepare); it was interrupted and verification switched to direct Node invocations. No editor package build/dev command was run, and no server was started/stopped. The unrelated lockfile resolution change from installation was removed.

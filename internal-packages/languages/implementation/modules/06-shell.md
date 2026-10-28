# Shell configuration and definition integration

Status: Pending consumer integration. Module: [`packages/shell`](../../../../packages/shell).

Connect UI locale/profile policy to the editor lifecycle and make all shell-defined labels update at render time.

## Prerequisites

- [Public i18n runtime and workspace bootstrap](01-public-runtime.md).
- [Editor API display metadata](02-editor-api.md).
- [Creator API message contracts](03-creator-api.md).
- [Shared component messages and accessibility](04-components.md).
- [UI package and duplicate widget audit](05-ui.md).

Namespace ownership: **shell and common**. [Source inventory](../inventories/06-shell.md)

## Files and surfaces to inspect

- `packages/shell/src/ConfigContext`
- `packages/shell/src/AppContext/AppContext.tsx`
- `packages/shell/src/helpers.ts`
- `packages/shell/src/ShellContext/ShellContext.tsx`
- `packages/shell/src/Layout`
- `packages/shell/src/PluginContext`
- `packages/shell/src/BackgroundTasks`
- `packages/shell/src/PresetOnboarding`
- `packages/shell/src/Notebook`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Add uiI18n configuration with explicit merge rules beside existing content i18n. Define the final persisted field names and adapt the internal defaultProfile schema; do not silently reinterpret existing saved settings.

2. Extend app/preset/layout/onboarding/template/preview definitions with optional display references and required-namespace/policy metadata. Merge inherited preset overlays in the same order as preset inheritance.

3. Mount the shared runtime after effective app/plugin/host configuration is known and before translated UI renders. Keep a stable provider identity and editor state.

4. Wire lazy plugin namespace registration and collision diagnostics into PluginContext. Translate plugin-manager metadata before/after module loading, including lazy-manifest fallback text.

5. Add an instance-bound formatter to background action context. Persist descriptor/value/fallback triples only for history intended to retranslate; keep diagnostic messages and stable status codes distinct.

6. Migrate shell navigation, menus, onboarding, notebook, previews, export controls, task labels, progress, toasts, validation and loading/error states. Format dates/times with explicit UI locale/time-zone policy.

7. Scope lang/dir and portal direction to the editor; reconcile config and selection on preset/plugin changes without remounting the vault or form stack.

## Acceptance checks

- [ ] Existing Config.i18n still controls content-language editing and exported IIIF remains unchanged.
- [ ] Inherited presets plus plain wording plus a host override produce the documented winner.
- [ ] A lazy plugin and task history update under a locale change without losing task or editing state.
- [ ] Old string-only panel/plugin definitions remain usable.

## Boundaries

Shell has nested ConfigProviders and merged plugin configuration; place the runtime at the effective configuration boundary, not at an arbitrary outer provider.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.

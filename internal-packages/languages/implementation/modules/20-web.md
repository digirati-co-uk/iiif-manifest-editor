# Web host locale preferences and application UI

Status: Pending consumer integration. Module: [`apps/web`](../../../../apps/web).

Add allowed, persistent interface preferences and localise host-owned UI without coupling reusable packages to Next.js.

## Prerequisites

- [Public editor facade and browser distribution](19-manifest-editor.md).
- [Project and draft controls](09-projects.md).

Namespace ownership: **web plus reusable editor namespaces**. [Source inventory](../inventories/20-web.md)

## Files and surfaces to inspect

- `apps/web/src/components`
- `apps/web/src/app`
- `apps/web/next.config.ts (inspect existing configuration filename)`

Paths identify starting points, not a complete allow-list. The inventory ranks actual files and gives individual locations. Proposed new paths are labelled as such; inspect existing exports and call sites before changing contracts.

## Implementation steps

1. Choose host default/available locale/profile policy, store user preferences separately from content-language config and supply initial SSR resources/selection consistently.

2. Add interface-language and wording controls. Hide combinations failing required-namespace coverage; define fallback/loading/error behaviour.

3. Migrate launcher, local/browser editor settings, project menus, tutorials and host error states. Audit MDX/JSON/help copy separately from the JS/TS inventory.

4. Review LegacyManifestEditor reachability before migrating its candidates; record explicit support/defer decisions.

5. Use locale-aware timestamps and language display names; coordinate root document lang/dir only in the full-page host.

6. Configure workspace TS transpilation/optional assets after the package boundary is integrated. Avoid introducing URL-localisation/routing requirements for the embedded editor.

## Acceptance checks

- [ ] A persisted UI preference renders identically on the server and first client render.
- [ ] Browser refresh and opening a project retain permitted preferences.
- [ ] Editing content in another language and exporting it preserves all language maps.
- [ ] Unsupported persisted choices fall back to the current allow-list.

## Boundaries

Changing the interface language must not rewrite project/content settings or require translated URL routing.

Keep stable IDs, protocol values and authored content outside UI lookups. Public code must not require the unpublished language package at runtime or in emitted declarations. Resolve references under the editor's shared public provider at render time; use fallback strings for definitions that have not yet migrated.

## Handoff

Record migrated directories, reviewed/exempted inventory entries, added semantic IDs, required namespaces and supported locale/profile combinations. Add translator context for placeholders and terminology. Link validation results and outstanding dependency UI to this guide. Mark this task complete only when its acceptance checks pass; seed catalogs alone do not complete a consumer migration.

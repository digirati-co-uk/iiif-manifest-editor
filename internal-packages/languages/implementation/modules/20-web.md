# Web host locale preferences and application UI

Status: Host provider and site/browser switcher bootstrap implemented; remaining web UI migration and integration pending. Module: [`apps/web`](../../../../apps/web).

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

## Parent host bootstrap

`apps/web/src/i18n/policy.ts` declares registered English/Dutch catalogs and standard/plain profiles. `NEXT_PUBLIC_MANIFEST_EDITOR_UI_LOCALES`, `...UI_PROFILES`, `...UI_DEFAULT_LOCALE` and `...UI_DEFAULT_PROFILE` can constrain the host policy; unknown/empty choices and unavailable defaults fail configuration validation. English remains a registered fallback even if it is not selectable. Source consumers use local no-emit TypeScript settings.

`WebI18nProvider` creates one stable runtime outside site/project/editor providers, imports optional Dutch stores, and keeps it across locale/profile/route renders. A successful snapshot synchronizes the full-page `lang`/`dir`; embedded scopes remain runtime-owned. The version-1 `manifest-editor-ui` cookie stores optional `locale` and `profile` separately from project/content-language config. Only changed choices are persisted, so changing wording does not silently persist the default locale. Invalid versions/values fall back to the current allow-list. Failed selections retain the prior cookie and UI. Default initialization does not write a preference.

The main root layout reads and validates the cookie before emitting HTML, then passes the same preferences to the client provider. This makes the cookie-owning root request-dependent, rather than relying on a client-only storage read or adding translated routes. No project data, existing storage key, content-language setting or URL is rewritten.

`HeaderLanguageSwitcher` wires the Claude-designed control to the effective runtime and React Aria locale, with translated accessible copy, loading/error status and portal direction. It is mounted in the site and BrowserEditor headers, including focused exhibition variants. Other local/share/examples/external/legacy headers, wording controls and the rest of web text remain for the module20 agent. Header styling uses structural selectors rather than translated accessible names; the site header uses two rows on narrow screens.

Validation: six web unit/interaction tests pass, including server-to-client Dutch/plain hydration, immutable policy validation, partial preference persistence, rejected selection, and mounted draft/undo fixture preservation. The host-focused no-emit config and targeted lint pass. Three actual Chromium tests pass on the existing port3000 server: the original create/edit/metadata/preview journey, saved Dutch SSR/hydration, and keyboard switching/reload with bounded 320px header controls. No server/build command was run. These checks do not establish complete translated editor forms or full vault/undo integration; those remain with modules07/20/23.

Coordinate effective shell/preset policy and host preference forwarding after module06 integration; keep its controlled callbacks authoritative. Do not replace this with no-op controls, client-only initial preference reads or locale-derived editor keys. Required-namespace deployment gating, remaining routes, and full Dutch inventory review are still pending.

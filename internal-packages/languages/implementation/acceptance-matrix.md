# Whole UI internationalisation acceptance matrix

The target is the complete supported editor interface in English and Dutch, with terminology profiles independent of UI locale and IIIF content languages. The foundation and seed catalogs alone do not meet this target. Each migrated module needs an implementation commit, review evidence and its own completed guide.

## Test environment

The user runs `pnpm dev` in the integrated terminal at `http://localhost:3000`. Reuse that process. Do not start, kill or restart a development server, and do not build packages locally.

The current Playwright configuration starts builds and its own server for the default `E2E_TARGET=local`. Use the existing `watch` target for live-server tests:

```sh
E2E_TARGET=watch node packages/playwright/node_modules/@playwright/test/cli.js test --config=packages/playwright/playwright.config.ts --project=chromium --workers=1
```

Run selected tests during integration; the full relevant suite is a final gate. Browser checks against this server verify the parent checkout, not an unintegrated child worktree. Use isolated test browser storage rather than editing the user's existing projects.

Invoke this from the repository root using the working Node 24 environment. In the current terminal environment, launching a login shell with `packages/playwright` as its working directory selects an old Homebrew Node 18 binary whose ICU library is missing. The root-level explicit Node CLI invocation avoids changing system tooling or the running server.

## Application surfaces

| Surface | Existing entry points | Acceptance evidence required |
| --- | --- | --- |
| Launcher and site navigation | `app/(main)/(site)/layout.tsx`, `components/site/GlobalNav.tsx`, site homepage | All built-in actions, tabs, onboarding/help and accessible names resolve in Dutch; native-language switcher remains usable at narrow widths. |
| Manifest and collection editor | `app/(main)/editor/[id]/page.tsx`, `components/browser-editor/BrowserEditor.tsx` | Shared forms, panels, creators, confirmations, validation, selection counts, background actions and enabled plugins translate; edited content and exports remain identical. |
| Exhibition workflows | `/editor/[id]/exhibition`, `/slideshow`, `/scroll`, corresponding `/editor-focused` routes | Each preset's complete workflow translates, including theme/tour/template UI; slide terminology survives standard/plain/profile changes and dark/focused headers. |
| Local file editor | `components/local-editor/LocalEditor.tsx` | Local header and editor share locale policy; loading, file actions and timestamps translate without changing file content. |
| Sharing and external editor | `app/(main)/share/page.tsx`, `components/external-editor/ExternalEditor.tsx` | Share/settings/connection/export/error UI translates, with unchanged URLs and transport data. |
| Examples and tutorials | `app/(main)/examples`, launcher tutorial controls | Product-owned instructions and navigation translate; authored example IIIF labels/content are not rewritten. |
| Iframe and remote browser integration | `components/iframe-preview`, `components/remote-editor`, public browser entry points | Built-in connection/loading/empty/unsupported-resource text translates; remote assets and independently loaded plugins use the host's runtime. |
| Supported legacy entry | `/legacy`, `components/LegacyManifestEditor` | Confirm support/reachability, then migrate supported UI or explicitly remove its advertised support in a separately justified change. Do not silently exclude it from a whole-UI completion claim. |
| Direct component and Vite use | `packages/components`, `packages/ui`, `apps/vite-example` | Shared runtime works without Next.js and with two independently configured embedded editors. |
| Dependency UI | Date/time pickers, rich-text controls, IIIF browsers/viewers, dialogs/tooltips/menus | Locale configuration or translated props cover built-in controls; any upstream limitation is identified and resolved or explicitly bounded before advertising coverage. |

## Cross-cutting gates

- [ ] Every supported first-party UI namespace has complete reviewed English and Dutch messages, including the plain and preset/profile messages it exposes. Required-message coverage does not count fallback English as Dutch.
- [ ] No product-owned hardcoded English remains in supported visible UI, accessibility labels, tooltips, validation, help, notifications or task/result histories. Heuristic exemptions are reviewed individually.
- [ ] Placeholders, rich tags and cardinal plural categories validate. Whole sentences replace English suffix/fragment concatenation, and Dutch terminology is consistent across modules.
- [ ] Keyboard-only switching works, selection is announced accessibly, focus behaves correctly, and narrow/light/dark/focused headers remain usable.
- [ ] Persisted preferences are constrained to available choices; first server/client render is consistent; selection changes update document/editor `lang` and `dir` at the owning boundary.
- [ ] Locale/profile switching preserves unsaved input, rich-text state, editing stack, vault identity, undo history and running background work.
- [ ] Two editors and concurrent server requests cannot leak locale/profile state. Portals and lazy plugins share the correct public provider.
- [ ] Authored IIIF labels, language maps, machine-translation source/target settings, generated labels, identifiers, selectors, protocol codes and exports remain unchanged by UI switching.
- [ ] Public ESM/CommonJS/browser artifacts resolve without an unpublished private package or duplicate provider. Use CI-produced artifacts for packaging checks while local builds remain prohibited.
- [ ] Existing meaningful English regression tests and complete Dutch journeys pass against the already-running server.

## Initial browser baseline

At foundation `288a0405`, `http://localhost:3000/?tab=recent` loaded successfully with the English `Get started` heading, six creation/opening actions, Recent/Examples/Tutorials tabs, and site navigation. The document language was `en`, there was no header language switcher and no UI-language preference key in browser local storage. These observations establish a baseline, not localisation completion.

The existing `01-basic.test.ts` Chromium journey passed against that same running server using `E2E_TARGET=watch`: create a manifest, edit its label, add/edit/reorder/delete metadata, then open a preview. Result: one passed test in 8.5 seconds. This proves the English baseline before integration, not Dutch coverage or locale-switch state preservation.

Some remote example thumbnails already returned external 404/blocked-image responses. Distinguish those pre-existing remote-content failures from runtime/hydration or translation failures when assessing later browser results.

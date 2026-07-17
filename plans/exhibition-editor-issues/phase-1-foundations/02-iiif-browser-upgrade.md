# 1.2 Upgrade IIIF Browser to `c69b412`

## Objective

Install the requested preview package, adopt its styling entry points correctly, and verify the existing creator still works in normal, scroll, slideshow, crop, multi-select, and history flows.

Requested package:

```text
https://pkg.pr.new/iiif-browser@c69b412
```

The local reference repo at `/Users/stephen/github.com/digirati-co-uk/iiif-browser` is already on `c69b412` and should be used to inspect exports and migration details.

## Owned files/areas

- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- Package manifests that directly consume `iiif-browser`
- `packages/creators/src/ContentResource/IIIFBrowserCreator/iiif-browser-form.lazy.tsx`
- Global CSS entry points that import IIIF Browser styles
- Focused creator/browser tests added for the upgrade

This task owns the Phase 1 lockfile update. Other Phase 1 tasks must not run a general install.

## Baseline facts

- The workspace currently points at `...iiif-browser@6665b7e`.
- `c69b412` moves MDX plugin styles into `iiif-browser/mdx-plugins.css` and pares the base `index.css` back to browser styles.
- MDX packages are optional peer integrations. Do not add `@mdxeditor/editor` merely to complete this dependency upgrade; that belongs to D.3 after its data-model decision.

## Implementation steps

1. Change the catalog entry to the exact requested package URL and run the narrow install needed to refresh the lockfile.
2. Inspect the package exports and compiled CSS. Keep the base creator on `iiif-browser/dist/index.css` (or the package's documented base entry) and do not import MDX-only styles globally.
3. Compare the creator's class names and container sizing with the updated browser's new style scope. Remove obsolete local overrides only where the new package makes them harmful.
4. Preserve the existing `history` object and default local-storage key. Do not introduce a new history key during the upgrade.
5. Confirm `output`, `navigation`, `customPages`, and supplied vault options still typecheck.
6. Record any upstream issue discovered in the local browser repo rather than patching compiled dependency output.

## Automated checks

- Run `pnpm --filter @manifest-editor/creators typecheck`.
- Run existing creator tests that cover IIIF Browser imports.
- Inspect `pnpm-lock.yaml` to ensure only the intended package graph changed.
- Do not build packages.

## Browser checks at localhost:3000

1. From a disposable exhibition, choose “Add new slide” and open IIIF Browser.
2. Open both supplied Leeds manifests, move between canvases, select a whole canvas, crop a canvas, rotate it, and use back/forward history.
3. Confirm the Select action, thumbnails, option panel, dialogs, focus outline, scroll regions, and modal sizing are usable at desktop and narrow widths.
4. Repeat from a scroll exhibition and a slideshow exhibition.
5. Close and reopen IIIF Browser and confirm existing browser history is still present under the established default key.

Rotation persistence into the editor is not acceptance for this task; it is implemented in Task 3.2. The rotation control itself must still work inside the browser.

## Acceptance criteria

- The workspace resolves IIIF Browser from `c69b412`.
- Base browser styling is correct and MDX-only CSS is not loaded globally.
- No existing history key is replaced or namespaced differently.
- Whole-canvas, crop, rotation UI, multi-select, and navigation remain usable in the existing creator.
- Dependency and lockfile changes are limited and reviewable.

## Commit guidance

Commit the dependency and style migration together once the typecheck and browser smoke pass, for example `chore(creators): update IIIF Browser preview package`.

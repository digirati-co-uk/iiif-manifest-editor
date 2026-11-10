# Dependency translation patches

Workspace installs apply the entries in `pnpm-workspace.yaml` through pnpm's patch mechanism. Run installs with `--ignore-scripts`; no package rebuild is required to apply these shipped-JavaScript changes.

## @mdxeditor/editor 4.0.4

`@mdxeditor__editor@4.0.4.patch` connects malformed-source feedback to the existing editor `useTranslation` hook. The three keys are `diffSource.parseError`, `diffSource.recovery` and `diffSource.details`; the components adapter resolves them in its `mdx` catalog group. Original parser diagnostics remain verbatim under localized technical details. Parser behavior, stored Markdown and view mode are unchanged.

The actual rich-editor regression switches English/Dutch with malformed source and verifies the same error-details DOM, source value, diagnostic and callback counts. Keep this patch until an upstream version provides these translation calls, then remove it and rerun the test. This workspace patch applies to the hosted application and workspace builds; independently installed external SDK consumers need equivalent dependency support before claiming the same coverage. No upstream package was published or modified remotely.

When refreshing a patch, edit a separate extracted copy rather than pnpm's installed store, retain the upstream license, and inspect only the intended dependency diff. Register/apply it using pnpm, verify the patch hash with a frozen install, and run the affected tests. `pnpm patch-commit` unexpectedly ran this repository's `prepare` hook despite an environment-only ignore-scripts setting; explicit installs with `--ignore-scripts` did skip scripts. Avoid relying on that environment setting. No build or dev-server command was run.

## iiif-browser 2.2.6, preview 8ac15ef

`iiif-browser@2.2.6.patch` adds the optional public `BrowserI18n` interface,
`BrowserI18nProvider` and `IIIFBrowserProps.i18n`. The inputs are generic callbacks
(`translate(key, EnglishFallback, values?)`, `formatRelativeTime`) plus optional
UI `locale`/`direction`. No vendor code imports the editor runtime or its catalogs.
The provider inherits an enclosing browser provider when no input is supplied.

The core browser ESM/CJS chunks, their declarations and root entries, the shared
image-options chunks and the MDX/Tiptap dialog variants are patched consistently.
Navigation, collection/manifest pagination, search/empty/loading/error states,
history/counts/time, image selection, image-options controls and accessible labels
resolve at display time. Built-in descriptors carry explicit `labelMessage` or
`titleMessage`; authored labels, custom output labels, IDs and payloads are retained.
Only built-in command descriptors are reindexed on translation changes, retaining
the query and store. Errors keep verbatim diagnostics under translated technical
details, alongside friendly translated feedback. Debug-only UI remains explicitly
English. The separate notebook/virtual-collection authoring UI is not advertised
as translated by this browser patch.

Components exposes `LocalizedIIIFBrowser`, `useIIIFBrowserI18n` and
`IIIFBrowserI18nProvider` for direct and plugin-owned browsers. See the
[module handoff](../internal-packages/languages/implementation/modules/04-dependency-localisation.md)
for consumer callsites that still need the adapter. The patch alone does not select
Dutch for callers that omit these optional inputs.

## @vidstack/react 1.12.12

`@vidstack__react@1.12.12.patch` adds optional per-player `uiTime` callbacks:
`formatSpokenTime(seconds)`, `formatTimeRange(currentTime, duration)` and
`formatSeek(seconds, 'forward' | 'backward')`. Range and seek callbacks return the
whole message; non-finite current time denotes live media. Missing callbacks retain
the original English behavior. The player prop is reactive and independent of
`MediaPlayer.lang`, media state, subtitle tracks and cue content.

Both shipped dev/prod core chunks and chapter hooks use the callbacks, with the
public `MediaPlayerProps` declaration extended. Components supplies
`useMediaTimeTranslations` and wires it into `IIIFMediaPlayer`. The installed
1.12.12 tarball declares worker/server entry paths but contains no `server/`
directory; there are no shipped server chunks to patch or verify. No new server
implementation or compatibility claim is made here.

## MDX source/search extension to the existing patch

The same 4.0.4 patch now uses the existing instance-scoped MDX translation hook to
supply CodeMirror phrases for source and diff views. A `Compartment` reconfigures
the phrase facet; an open search panel is refreshed via public search commands,
retaining the query, replacement, focus/caret, editor selection and undo history.
Only `docChanged` transactions publish Markdown updates. Diff revert controls
receive translated names through the existing MergeView reconfiguration API.

The patch adds an explicit `@codemirror/search` dependency to the extracted package
manifest. The root `packageExtensions` entry is also required because pnpm resolves
dependency graphs before applying manifest patches. The test-only CodeMirror
imports in components reuse the existing pinned resolutions. Keep the extension
and manifest patch together until upstream support makes them unnecessary.

## Refresh and distribution limits

Edit an independent extracted copy, never pnpm store files/hardlinks. Generate
ordinary git-format patches from the pristine and edited copies, retain the
original malformed-source hunk, register the version-specific paths in
`pnpm-workspace.yaml`, then resolve/apply with explicit `--ignore-scripts` flags.
Inspect lockfile changes: only patch hashes, affected resolutions/importers and
intentional dependencies/checksums should change. A subsequent
`pnpm install --ignore-scripts --frozen-lockfile` verifies application without
lifecycle hooks. Do not use this repository's build/prepack/prepare commands.

Run the real component tests, the Vidstack production-distribution test, targeted
no-emit checks and the strict Dutch gate after refreshing. Shipped JavaScript is
patched directly; upstream source maps are retained and may point at upstream
locations. No dependency rebuild, upstream publication or remote mutation occurs.
Workspace patches cover hosted workspace installs; external npm SDK consumers need
equivalent upstream support or these same patches and dependency extension.
Publication bundles/tarballs remain unverified while builds are prohibited.

After changing patch hashes, synchronize the whole workspace with
`pnpm install --ignore-scripts --frozen-lockfile` before cross-package verification.
A filtered install can leave consumers outside its scope linked to the previous
unpatched virtual package while shared libraries use the new copy. Parent's real
web-browser-context test reproduced that mismatch; the full scripts-disabled
installation restores a single matching browser identity across those consumers.

## Leaflet.draw 1.0.4 / Leaflet 1.9.4

`leaflet-draw@1.0.4.patch` adds an optional **per-map** API to both shipped
`dist/leaflet.draw.js` (the package main) and `dist/leaflet.draw-src.js`, plus the
side-effect import's Leaflet augmentation in `localisation.d.ts`:

```ts
import "leaflet-draw";
map.setDrawLocalisation({
  translate(path, legacyFallback) {
    return dictionary[path] ?? legacyFallback;
  },
  formatMeasurement(kind, numericValue, options) {
    /* whole distance/area message */
  },
  formatRadius(numericRadius, options) {
    /* whole radius sentence */
  },
});
// The same input can be supplied as MapOptions.drawLocalisation before controls mount.
// Update the input to refresh live copy; undefined restores legacy English/global behavior.
map.setDrawLocalisation(undefined);
```

Callbacks return plain text. `translate` paths follow the original dictionary's
`draw.*` / `edit.*` structure; measurement callbacks receive the original numeric
value in metres or square metres and existing metric/feet/nautic/precision options.
They return complete messages, without parsing or replacing formatted English.
No callback imports editor code, and `L.drawLocal` is never changed by the API.
The unchanged legacy dictionary (including its numeric delimiter options) is still
the fallback for callers that omit the input/callbacks. Use the dictionary's
existing `draw.handlers.polyline.error` key for crossing feedback.

A map event refreshes toolbar titles/accessible names, disabled explanations,
existing action link text and semantic tooltip content factories. No controls,
buttons, handlers, event bindings, draft vertices or layers are recreated. Factories
re-read current geometry/error state; they do not replay pointer events. Initial
handler labels use the constructor's map even before `_map` exists. Per-instance
Polyline options avoid writing a localized error into shared prototype options.
Circle resize feedback also fixes the upstream `editTooltip`/`_editTooltip` typo
and scopes its previously undeclared radius variable. The patch retains upstream
licenses and source maps; maps still refer to original upstream locations.

NavPlaceEditor's `EditControl` supplies the public editor runtime adapter. Its
separate zoom adapter updates only the known zoom control's existing button
`title`/`aria-label` attributes: Leaflet's zoom option props are initialization-only.
Cleanup restores the map's prior input and zoom names. NavPlaceEditor keeps draw
configuration identity stable; explicit caller option changes retain their original
control replacement behavior. When the patch is absent in an external install,
the optional setter call leaves Draw's legacy English behavior intact; localized
zoom names still work. Such an installation does **not** have localized Draw UI.

Refresh by extracting the pristine 1.0.4 registry tarball into an independent tree,
editing its shipped distributions and declarations, and generating a normal patch
diff against that tree. Do not edit pnpm store hardlinks, build/minify upstream,
or use `pnpm patch-commit` lifecycle hooks. Update the workspace patch hash with an
explicit scripts-disabled install, inspect the lockfile, then run the full-workspace
`pnpm install --ignore-scripts --frozen-lockfile` so consumers share the new identity.
The editor map tests execute both distributions with real Leaflet/Draw and runtime
instances. JSDOM verifies state/DOM/events, not visual pointer interaction. Parent
owns live browser acceptance. External npm consumers must apply the equivalent
patch or receive upstream support; no upstream publication or tarball/build
verification is claimed.

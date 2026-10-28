# Component dependency localisation handoff

This extends [module 04](04-components.md). The three assigned dependency-owned gaps
are implemented in this workspace, with real English/Dutch component evidence.
Consumer adapter wiring and integrated browser/release checks remain separate.
Only components, its EN/NL catalog/notes/reviews, maintained patches and their root
installation metadata changed. No consumer source, runtime registry, shared index,
generated inventory, TS config or server was changed.

## Contracts and implemented behavior

- **iiif-browser 2.2.6**, pinned to the existing `pkg.pr.new` preview **8ac15ef**:
  inspected its actual public props/configuration first; no general dictionary was
  available. The patch exposes optional generic `BrowserI18n`,
  `BrowserI18nProvider` and `IIIFBrowserProps.i18n`. Components exports
  `useIIIFBrowserI18n`, `LocalizedIIIFBrowser` and `IIIFBrowserI18nProvider`.
  The provider is instance-local and inherits existing input when omitted.
  UI locale/direction are scoped to the browser root; plugin-host scopes also
  bridge React Aria locale and portal context.
- Reviewed core navigation/header/footer, home/about/history/not-found/loading,
  collection/manifest grid/list/pagination, internal/external/grouped search,
  source/error feedback, selected-resource summaries, image-source alternatives,
  crop/zoom/rotation, shared image options and MDX/Tiptap browser dialog branches.
  Whole history/selection counts, pagination, request-size/crop descriptions and
  loading/errors use messages. Semantic `count` stays numeric; display numbers
  use the UI locale. Quality option labels translate while `gray`, `default`,
  formats, request coordinates and URLs remain protocol values.
- Built-in labels/titles have explicit display metadata. No matching/replacement of
  arbitrary resource text is used. Built-in command labels are reindexed for
  Dutch searches while retaining the current query and browser stores; resource
  search indexes retain authored labels. Custom section headings, output labels,
  resource/history labels and action IDs keep precedence and meaning.
  Original technical errors remain verbatim inside translated technical details.
- **Vidstack 1.12.12**: the existing layout dictionary was insufficient for time
  speech. Optional reactive per-player `uiTime` accepts `formatSpokenTime`,
  `formatTimeRange` and `formatSeek`. Dev/prod time-slider ARIA, the seek announcer
  and chapter-option durations use these callbacks. Components exports
  `useMediaTimeTranslations` and wires it into `IIIFMediaPlayer`. Complete range,
  live and directional seek messages use EN/NL catalogs; units use semantic plurals
  and locale-formatted numbers/lists. `MediaPlayer.lang` remains content/subtitle
  language. No playback/source/track/current-time prop changes are used for UI locale.
- **MDXEditor 4.0.4**: retains the existing malformed-source patch. Its existing
  translation callback now also supplies 34 CodeMirror phrases through an
  instance-local `Compartment`. Source and diff views reconfigure without replacing
  their documents/views/history. The public search-panel commands refresh an open
  panel and restore its query, replacement, focused control and text caret, including
  when the editor has a nonempty selection. Diff revert labels reconfigure through
  MergeView. Locale/search transactions do not publish false Markdown changes.

All vendor inputs are generic; vendor code never imports `@manifest-editor/i18n`
or private catalogs. Defaults remain English when callbacks are absent. Both
browser ESM/CJS roots and shared MDX/Tiptap image-options/dialog chunks are covered.
Types accompany the new optional inputs. MDX's new direct search import has a
matching manifest patch and pnpm `packageExtensions` dependency.

## Authored-content and explicit exclusions

Authored InternationalString maps, resource/history titles, URLs, IDs, callbacks,
image alt-text drafts, protocol enum values, media/caption languages, rich-editor
Markdown and storage/history semantics remain data. Existing fallback text that
becomes editable/persisted image content (for example `IIIF image`) remains content;
UI translation does not silently rewrite it. Missing display-only resource names
are resolved at render time, without inserting translated language maps into Vault.

Exact-source `Digirati` is the upstream brand on the About page. `URL`, `JSON`,
`JSON-LD`, MIME types, IIIF resource identifiers, format extensions, filenames,
selector data and diagnostic details are technical data. DebugSelected/DebugHistory
and console/invariant diagnostics remain explicitly English developer surfaces.
The separate notebook/virtual-collection authoring product UI is outside this
browser/image-options patch; wrapping it localises its embedded browsers, not all
notebook commands or authored defaults. No DOM text observer, string-replacement
heuristic, hidden-control workaround, global locale singleton or Intl monkeypatch
was introduced.

## Catalog evidence

Components has **385 source keys**, including **196 browser**, **34 CodeMirror**
and **10 media-time** keys added here, with complete real Dutch values. The five
new exact-source reviews are individual `canvas`/`Canvas` and `manifest`/`Manifest`
technical type/icon names, aligned with editor-api terminology. History counts use
Dutch `vermelding`/`vermeldingen`. No English-copy approvals or wildcard exemptions.
Translator notes explain authored names, display numbers, whole seek/range grammar
and CodeMirror's literal `$` substitution token. Standard EN/NL is covered; plain
profiles inherit these component messages. No new complete plain-language wording
coverage is claimed.

## Portable adapter wiring for consumer owners

```tsx
import {
  LocalizedIIIFBrowser,
  useIIIFBrowserI18n,
  IIIFBrowserI18nProvider,
  useMediaTimeTranslations,
} from "@manifest-editor/components";

<LocalizedIIIFBrowser {...browserProps} />;
// Or retain the dependency import:
const i18n = useIIIFBrowserI18n();
<IIIFBrowser {...browserProps} i18n={i18n} />;

// A plugin host needs context around both its browser and sibling image-options UI.
<IIIFBrowserI18nProvider>
  <MyRichEditor />
</IIIFBrowserI18nProvider>;

const uiTime = useMediaTimeTranslations();
<MediaPlayer uiTime={uiTime} lang={contentLanguage}>
  {children}
</MediaPlayer>;
```

The components `MDXEditor` and `IIIFMediaPlayer` already wire these adapters.
Remaining direct browser callsites, deliberately not edited in this scope:

- `apps/web/src/components/browser-editor/IIIFBrowserModal.tsx`.
- `packages/creators/src/Canvas/InternalCanvas/index.tsx`.
- `packages/creators/src/Manifest/ManifestBrowserCreator/manifest-browser-form.lazy.tsx`.
- `packages/creators/src/ContentResource/IIIFBrowserCreator/iiif-browser-form.lazy.tsx`.
- `presets/collection-preset/src/components/PreviewManifestInBrowser.tsx`.
- Shell's Tiptap/notebook host: `packages/shell/src/Notebook/ProjectNotebook.tsx`
  and `notebook.ts`; wrap the host with `IIIFBrowserI18nProvider` for browser/image
  dialogs. Its independent notebook commands need their own dependency coverage.
- Editors' linking-property browser trigger delegates to the creator callback
  (`components/LinkingPropertyList/LinkingPropertyList.tsx` and
  `definitions/LinkingProperties/LinkingProperties.tsx`); localise its caller-owned
  trigger in the editors namespace and wire the actual creator browser above.

Consumers still own their supplied output/action labels and plugin content. Never
translate creator IDs, selected resource payloads, histories or authored titles.
Patch installation alone does not enable Dutch in a caller omitting the adapter.

## Validation and remaining boundaries

Final check results are recorded in module 04. New tests mount actual dependency
components with the public Dutch runtime; they do not mock rendering/translation.
The image-options test supplies a deterministic fetched Image API document. jsdom
uses browser-primitive shims (observers, media queries, ranges, VTTCue); the media
slider is explicitly styled visible because jsdom lacks computed default opacity.
Media tests drive the real player's reactive state and track list, not a network
playback backend. CJS cold loading is allowed a 20-second test timeout.

Parent owns integrated browser checks in the main checkout: actual playback,
keyboard/screen-reader behavior, crop geometry, rich-editor whole-app undo and
consumer wiring. This worktree did not use the parent's port-3000 server.
No default/local Playwright webServer setup was run.

The installed Vidstack tarball contains dev/prod ESM and declarations, but no
`server/` directory despite its worker export paths. There are no shipped server
chunks here to patch or verify; that pre-existing distribution limit remains.
Patch source maps retain upstream locations. No package build/publication artifact,
external installed SDK, dependency rebuild, upstream publication, push or PR is
claimed verified. Hosted installs apply the maintained patches; external consumers
need equivalent upstream APIs or the patches and MDX dependency extension.

## Parent integration evidence

Integrated both commits with shell and editors. Frozen scripts-disabled installation passes. Parent reran **16 component tests**, the **one production Vidstack test**, components no-emit check and strict Dutch validation: **1555 required messages, zero missing/unreviewed English copies** across the combined catalogs. This is declared catalog coverage only.

Shell's ProjectNotebookPanel now wraps the notebook host in `IIIFBrowserI18nProvider`, so its browser and sibling image-options dialogs inherit the effective runtime. Independent notebook commands remain an open dependency surface. Creator, collection and web direct browsers remain assigned to their consumer modules.

The existing Chromium create/edit/metadata/preview journey passes after integration. Both SSR/header tests currently fail on HTTP 500 with `Duplicate use of selection JSON ID gapcursor` in Turbopack's ProseMirror module evaluation after dependency installation; client hydration can still display the translated header. Root cause and clean-server verification remain unresolved. No server restart, cache deletion, dependency global guard or disabled SSR workaround was used. Earlier three-test browser success was before this dependency integration and is not a current combined acceptance result.

<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/components"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fcomponents" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/components

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Shared React controls, icons, forms, media components, and layout primitives used throughout Manifest Editor.

## Quick start

```sh
npm install @manifest-editor/components
```

```tsx
import { ActionButton } from "@manifest-editor/components";
import "@manifest-editor/components/lib.css";

export function SaveButton() {
  return <ActionButton primary onPress={() => console.log("Save requested")}>Save</ActionButton>;
}
```

Use React 19. Components that read IIIF resources or editor state need the corresponding Vault or shell providers. The combined editor includes the shared styles.

Rich-text editors, media playback and the IIIF browser load their implementations when mounted,
using React lazy boundaries with localized loading indicators. These boundaries also work in
non-Next hosts. Imperative editor refs become available when the deferred component mounts.
Locale/profile changes keep the mounted editor and its draft state intact.

ESM/CJS application bundlers can split these implementations into separate chunks. The classic
CDN facade keeps its single integrity-checked script and defers their initialization within it.

## API overview

- Controls: `ActionButton`, `IconButton`, selection controls, tooltips, and menus.
- Layout: sidebars, tabs, modals, and thumbnail grids.
- IIIF UI: manifest and collection list items, media rendering, and thumbnails.
- Editing UI: HTML/MDX editing, form fields, notices, and progress feedback.
- Icons and hooks are exported from the package root.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/components/src) for the complete API and TypeScript definitions.

## Interface language

Package-owned labels use the shared `@manifest-editor/i18n` runtime. Without an
`EditorI18nProvider`, controls use the built-in English catalog. Wrap components
in the host's existing provider to share live locale and wording changes; this
package never creates a second provider instance or reads browser language/storage
for UI selection. The host explicitly enables optional Dutch catalogs from
`@manifest-editor/i18n/nl` (see the runtime README).

`CreatorGrid` accepts optional `labelMessage`, and its items accept `titleMessage`
and `descriptionMessage`. Panel menu items and sidebar tabs accept `labelMessage`;
`SidebarHeader` and its actions accept `titleMessage`; `IconButton` accepts
`labelMessage`. These serialisable public message references resolve at render
time, with the existing string props as legacy fallbacks. Keep stable IDs unchanged.

Caller-supplied children, labels and IIIF `InternationalString` values remain caller
content. UI locale does not change content languages, caption languages, generated
resource data or download filenames. Tooltip/modal/toast portals retain the shared
React context and carry the UI language/direction. React Aria collection, modal
and toast roots also receive the selected UI locale for dependency instructions.

The module implementation guide records dependency-owned localisation gaps and
validation evidence; optional catalogs alone do not establish whole-editor coverage.

### Dependency adapters

The hosted workspace maintains version-specific patches for `iiif-browser` 2.2.6,
`@vidstack/react` 1.12.12 and MDXEditor 4.0.4. These adapters require those patches
(or equivalent upstream APIs); independently installed npm consumers do not receive
the workspace patches automatically. See [patch maintenance](../../patches/README.md).

```tsx
import {
  LocalizedIIIFBrowser, IIIFBrowserI18nProvider,
  useIIIFBrowserI18n, useMediaTimeTranslations,
} from "@manifest-editor/components";

// Direct browser: resolves built-in UI under the existing editor runtime.
<LocalizedIIIFBrowser {...browserProps} />;

// Plugin hosts: covers browser dialogs and their sibling image-options screens.
<IIIFBrowserI18nProvider><MyTiptapEditor /></IIIFBrowserI18nProvider>;

// When keeping the dependency's component import:
const i18n = useIIIFBrowserI18n();
<IIIFBrowser {...browserProps} i18n={i18n} />;

// Independent media consumers; contentLanguage still selects subtitle/content language.
const uiTime = useMediaTimeTranslations();
<MediaPlayer uiTime={uiTime} lang={contentLanguage}>{children}</MediaPlayer>;
```

`MDXEditor` already supplies the browser provider and existing MDX translation
callback. `IIIFMediaPlayer` already supplies time speech and the layout dictionary.
Locale switches update phrases/formatters and built-in command search without
remounting browsers, players or source editors. Caller output labels remain caller
content; migrate them in their owning namespace. Browser message metadata applies
only to explicit UI descriptors, never by matching the text of an authored label.

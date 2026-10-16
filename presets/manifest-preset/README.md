<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/manifest-preset"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fmanifest-preset" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/manifest-preset

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Standard manifest editing: canvases, metadata, media, ranges, annotations, and bulk actions.

## Quick start

```sh
npm install @manifest-editor/manifest-preset
```

```ts
import * as manifestPreset from "@manifest-editor/manifest-preset";
import { mapApp } from "@manifest-editor/shell";

export const app = mapApp(manifestPreset);
```

Use `app` as the `definition` of `AppProvider`, with `appId={app.metadata.id}`. See the [shell quick start](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/shell#quick-start) for provider nesting, Vault loading, and styles. The combined `ManifestEditor` chooses this preset automatically for Manifest resources.

## API overview

- Default app metadata (`id`, `title`, and project type).
- `centerPanels`, `leftPanels`, `rightPanels`, `modals`, and `background` layout definitions.
- `editors`, `creators`, `resources`, `backgroundActions`, and `plugins`.
- Exported annotations, AV ranges, and canvas-label plugin modules.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/presets/manifest-preset/src) for the complete API and TypeScript definitions.

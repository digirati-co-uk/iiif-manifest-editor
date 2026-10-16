<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/exhibition-preset"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fexhibition-preset" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/exhibition-preset

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Exhibition authoring: themed slides, guided tours, text/media blocks, and exhibition previews.

## Quick start

```sh
npm install @manifest-editor/exhibition-preset
```

```ts
import { exhibitionEditorPreset } from "@manifest-editor/exhibition-preset";

export const app = exhibitionEditorPreset;
```

Use `app` as the `definition` of `AppProvider`, with `appId={app.metadata.id}`. See the [shell quick start](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/shell#quick-start) for provider nesting, Vault loading, and styles. The combined component does not have a `preset` prop: use the shell composition API to mount this exhibition preset.

## API overview

- `exhibitionEditorScrollingPreset` and `exhibitionEditorSlideshowPreset`: alternative mapped layouts.
- `PresetIcon`, `imageServiceSlideCreator`, its payload type, and `useExhibitionPreviewWindow`: exhibition integration helpers.
- `exhibitionEditorPreset`: a mapped app definition containing metadata, layout, and configuration. Pass it directly to `AppProvider`; do not call `mapApp` again.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/presets/exhibition-preset/src) for the complete API and TypeScript definitions.

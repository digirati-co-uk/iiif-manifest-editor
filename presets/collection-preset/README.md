<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/collection-preset"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fcollection-preset" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/collection-preset

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Collection editing: collection metadata and links to existing manifests.

## Quick start

```sh
npm install @manifest-editor/collection-preset
```

```ts
import { collectionPreset } from "@manifest-editor/collection-preset";

export const app = collectionPreset;
```

Use `app` as the `definition` of `AppProvider`, with `appId={app.metadata.id}`. See the [shell quick start](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/shell#quick-start) for provider nesting, Vault loading, and styles. The combined `ManifestEditor` chooses this preset when `resource.type` is `Collection`.

## API overview

- `collectionPreset`: a mapped app definition containing metadata, layout, and configuration. Pass it directly to `AppProvider`; do not call `mapApp` again.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/presets/collection-preset/src) for the complete API and TypeScript definitions.

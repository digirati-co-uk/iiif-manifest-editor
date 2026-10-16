<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/ocr-classification"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Focr-classification" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/ocr-classification

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Classify canvas images for OCR difficulty using the plugin’s background action.

## Quick start

```sh
npm install manifest-editor @manifest-editor/ocr-classification react@19 react-dom@19
```

```tsx
import { ManifestEditor } from "manifest-editor";
import * as plugin from "@manifest-editor/ocr-classification";
import "manifest-editor/index.css";

export function Editor() {
  return (
    <ManifestEditor
      resource="https://wellcomelibrary.org/iiif/b18035723/manifest"
      plugins={[plugin]}
      enabledPlugins={["@manifest-editor/ocr-classification"]}
    />
  );
}
```

The lazy entry point defers loading the action implementation until needed. Import the module namespace (`import * as plugin`) when registering it: the default export alone contains only metadata.

## API overview

- Default export: plugin metadata (ID, label, supported apps/resources, and default enabled state).
- `backgroundActions`, action factory, OCR difficulty helpers, and the `/lazy` entry point.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/plugins/ocr-classification/src) for the complete API and TypeScript definitions.

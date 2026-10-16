<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/ocr-docling"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Focr-docling" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/ocr-docling

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Run Granite Docling OCR locally in a browser worker and write the results as IIIF text annotations. The model requires an approximately 500 MB download.

## Quick start

```sh
npm install manifest-editor @manifest-editor/ocr-docling react@19 react-dom@19
```

```tsx
import { ManifestEditor } from "manifest-editor";
import * as plugin from "@manifest-editor/ocr-docling";
import "manifest-editor/index.css";

export function Editor() {
  return (
    <ManifestEditor
      resource="https://wellcomelibrary.org/iiif/b18035723/manifest"
      plugins={[plugin]}
      enabledPlugins={["@manifest-editor/ocr-docling"]}
    />
  );
}
```

Choose the prompt and image size in plugin settings. If your bundler does not expose the packaged worker correctly, configure a public `workerUrl` for the Docling worker. Import the module namespace (`import * as plugin`) when registering it: the default export alone contains only metadata.

## API overview

- Default export: plugin metadata (ID, label, supported apps/resources, and default enabled state).
- `settings`, `backgroundActions`, annotation conversion and configuration helpers; `/lazy` and `/docling-worker` entry points.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/plugins/ocr-docling/src) for the complete API and TypeScript definitions.

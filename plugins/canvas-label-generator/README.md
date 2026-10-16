<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/canvas-label-generator"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fcanvas-label-generator" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/canvas-label-generator

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Generate or normalise canvas labels from patterns, filenames, existing labels, and ranges.

## Quick start

```sh
npm install manifest-editor @manifest-editor/canvas-label-generator react@19 react-dom@19
```

```tsx
import { ManifestEditor } from "manifest-editor";
import "manifest-editor/index.css";

export function Editor() {
  return (
    <ManifestEditor
      resource="https://wellcomelibrary.org/iiif/b18035723/manifest"
      enabledPlugins={["@manifest-editor/canvas-label-generator"]}
    />
  );
}
```

The standard manifest preset already includes this plugin, disabled by default. Enable it by ID instead of registering it twice. Import the module namespace (`import * as plugin`) when registering it: the default export alone contains only metadata.

## API overview

- Default export: plugin metadata (ID, label, supported apps/resources, and default enabled state).
- `settings`, `backgroundActions`, generator configuration, pattern presets, and result helpers.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/plugins/canvas-label-generator/src) for the complete API and TypeScript definitions.

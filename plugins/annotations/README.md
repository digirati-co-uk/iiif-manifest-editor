<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/annotations"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fannotations" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/annotations

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Create and inspect canvas annotations, inline external annotation pages, and run bulk annotation imports.

## Quick start

```sh
npm install manifest-editor @manifest-editor/annotations react@19 react-dom@19
```

```tsx
import { ManifestEditor } from "manifest-editor";
import "manifest-editor/index.css";

export function Editor() {
  return (
    <ManifestEditor
      resource="https://wellcomelibrary.org/iiif/b18035723/manifest"
      enabledPlugins={["@manifest-editor/annotations"]}
    />
  );
}
```

The standard manifest preset already includes this plugin, enabled by default. Do not register it twice. Import the module namespace (`import * as plugin`) when registering it: the default export alone contains only metadata.

## API overview

- Default export: plugin metadata (ID, label, supported apps/resources, and default enabled state).
- `leftPanels`, `annotations`, `background`, `backgroundActions`, annotation constants, and importer helpers.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/plugins/annotations/src) for the complete API and TypeScript definitions.

<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/editors"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Feditors" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/editors

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

React property editors and canvas editing tools used by the standard presets. This is the UI layer above `@manifest-editor/editor-api`.

## Quick start

```sh
npm install @manifest-editor/editors
```

```tsx
import { allEditors, CanvasPanelEditor } from "@manifest-editor/editors";

export const editors = allEditors;
export function CanvasWorkbench() {
  return <CanvasPanelEditor />;
}
```

Render the workbench inside an existing shell with a selected canvas and Vault context. This is not a standalone canvas viewer; most components rely on editor providers.

## API overview

- `allEditors`: built-in editor definitions for registration in a preset.
- `CanvasPanelEditor` and exported field/editor components.
- Editor definitions for descriptive, technical, linking, structural, annotation, and media properties.
- Hooks and helpers for annotation editing, image choices, positioning, and canvas targets.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/editors/src) for the complete API and TypeScript definitions.

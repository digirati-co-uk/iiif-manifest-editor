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

## API overview

- Controls: `ActionButton`, `IconButton`, selection controls, tooltips, and menus.
- Layout: sidebars, tabs, modals, and thumbnail grids.
- IIIF UI: manifest and collection list items, media rendering, and thumbnails.
- Editing UI: HTML/MDX editing, form fields, notices, and progress feedback.
- Icons and hooks are exported from the package root.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/components/src) for the complete API and TypeScript definitions.

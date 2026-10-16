<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/workspace-private-lightgrey" alt="Private workspace package">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/ui

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Private legacy UI workspace package. Its source components are consumed by other packages during development/building; it is not published to npm. For public reusable components, use `@manifest-editor/components`.

## Quick start

From another package in this monorepo, declare `"@manifest-editor/ui": "workspace:*"`, then import an explicit exported subpath:

```tsx
import { ManifestEditorLogo } from "@manifest-editor/ui/atoms/ManifestEditorLogo";
```

The consuming toolchain must compile TypeScript/TSX and the relevant styles.

## API overview

Subpath exports cover atoms, icons, layout components, modal controls, media controls, and legacy editing widgets. There is no useful root barrel export. See [`package.json`](./package.json) for the supported paths.

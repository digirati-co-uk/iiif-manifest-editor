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

## Interface language

Display copy uses the shared `@manifest-editor/i18n` provider. English is the standalone default; hosts opt into Dutch using the public `@manifest-editor/i18n/nl` catalogs. Locale and wording profile changes update mounted controls and open dialogs. Caller-supplied labels/messages and authored IIIF language maps stay caller-owned.

This is a **private source package**, with no publication build or bundler configuration. Publishing consumers must keep `@manifest-editor/i18n` external (including declarations); do not inline its provider/context when bundling these sources. There is no UI-local translation provider or private catalog import. See [module 05](../../internal-packages/languages/implementation/modules/05-ui.md) for the supported entry points, dormant widgets, dependency locale behavior, and validation limitations.

Targeted checks from the repository root, without builds:

```sh
node packages/ui/node_modules/vitest/vitest.mjs run --config packages/ui/vitest.config.ts
node node_modules/typescript/bin/tsc --noEmit -p packages/ui/tsconfig.i18n.json
node node_modules/oxlint/bin/oxlint packages/ui
npm --prefix internal-packages/languages run translations:check
```

<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/workspace-private-lightgrey" alt="Private workspace package">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @repo/typescript-config

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Private shared TypeScript configurations for this monorepo. This package contains JSON configuration files, not runtime code.

## Quick start

Add `"@repo/typescript-config": "workspace:*"` to a workspace package's development dependencies, then extend the appropriate configuration:

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "include": ["src"],
  "compilerOptions": { "outDir": "dist" }
}
```

## Configuration overview

- `base.json`: strict checking, ES2022, bundler module resolution, and browser libraries.
- `library.json`: base settings plus declaration files and declaration maps.
- `react-library.json`: library settings plus the React JSX transform.
- `nextjs.json`: Next.js checking with preserved JSX, incremental checking, and no emit.

Override paths and include/exclude patterns in the consuming package.

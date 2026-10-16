<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/workspace-private-lightgrey" alt="Private workspace package">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# playwright

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Private end-to-end test workspace for Manifest Editor. This is not the public Playwright npm package and is not an application dependency.

## Quick start

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter playwright exec playwright install chromium
pnpm e2e:dev
```

`e2e:dev` targets the deployed development preview. Use `pnpm e2e:local` for a managed local build/server/test run when port 3000 is free.

## Command overview

- `pnpm e2e:local`, `pnpm e2e:dev`, `pnpm e2e:prod`: repository-level test targets.
- `pnpm dev:test`: local development workflow with the Playwright UI.
- `pnpm --filter playwright test:report`: open the last HTML report.
- `screenshots:exhibition-presets`: capture exhibition preset thumbnails.

There is no runtime library API. See the repository README for development workflow details.

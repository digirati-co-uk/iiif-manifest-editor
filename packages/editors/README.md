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

## Interface translations

These editors share the host's `@manifest-editor/i18n` provider. Enable reviewed Dutch through `@manifest-editor/i18n/nl`; the standalone fallback remains English. UI locale and plain wording never choose or replace authored content languages. `LanguageFieldEditor.labelMessage` and editor/media-section definition `labelMessage` references resolve at render time, retaining the legacy label string as fallback. Definitions remain serialisable.

Layout, behavior and property UI consumes the editor-api display metadata. `createAppActions(editor, callback?, editorsTranslate?, commonTranslate?)` and `getPaintingChoiceCandidates(vault, refs, editorsTranslate?)` retain their standalone English defaults; callers in a provider pass its real translators. Callbacks continue to receive the original resource references, technical strings, geometry and InternationalString values.

Atlas controls cross both a custom renderer and separate DOM roots. Internal i18n boundaries transfer the actual runtime instance, preserve an inherited provider when available and never pass a spread hook snapshot as an instance. UI locale/profile changes do not key or recreate the viewer, text editor, annotation request or field state.

Run checks from the repository root using the working Node runtime, without builds:

```sh
node packages/editors/node_modules/vitest/vitest.mjs run --config packages/editors/vitest.config.ts
node node_modules/typescript/bin/tsc -p packages/editors/tsconfig.source.json
node node_modules/typescript/bin/tsc -p packages/editors/tsconfig.test.json
node node_modules/oxlint/bin/oxlint packages/editors/src packages/editors/test
npm --prefix internal-packages/languages run translations:check
```

The no-emit configs use workspace source mappings and a local `allowImportingTsExtensions`; shared TS configs are unchanged. Existing source diagnostics remain visible. See [module 07](../../internal-packages/languages/implementation/modules/07-editors.md) for the exact baseline, dependency limitations and pending integrated browser/publication gates. Neither a catalog pass nor these component tests establishes whole-application translation completion.

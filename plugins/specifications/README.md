<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/specifications"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fspecifications" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/specifications

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Display configured project specifications, validation results, and links to the fields that need attention.

## Quick start

```sh
npm install manifest-editor @manifest-editor/specifications react@19 react-dom@19
```

```tsx
import { ManifestEditor } from "manifest-editor";
import * as plugin from "@manifest-editor/specifications";
import "manifest-editor/index.css";

export function Editor() {
  return (
    <ManifestEditor
      resource="https://wellcomelibrary.org/iiif/b18035723/manifest"
      plugins={[plugin]}
      enabledPlugins={["@manifest-editor/specifications"]}
    />
  );
}
```

Configure specifications in the shell; enabling this panel alone does not create validation rules. Import the module namespace (`import * as plugin`) when registering it: the default export alone contains only metadata.

## API overview

- Default export: plugin metadata (ID, label, supported apps/resources, and default enabled state).
- `leftPanels`: the specifications panel. The default export supplies plugin metadata.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/plugins/specifications/src) for the complete API and TypeScript definitions.

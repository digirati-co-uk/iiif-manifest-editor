<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/creators"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fcreators" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/creators

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

The built-in resource creation forms and functions: images, audio, video, HTML, canvases, annotations, ranges, and providers.

## Quick start

```sh
npm install @manifest-editor/creators
```

```ts
import { allCreators, imageUrlCreator } from "@manifest-editor/creators";

// Use these definitions in a custom shell preset.
export const creators = allCreators;
export const imageOnlyCreators = [imageUrlCreator];
```

The manifest preset already registers the standard creators. Use individual definitions when composing your own preset; render them through the shell creator UI.

## Choose a creator for the job

A content resource and an annotation that paints it onto a Canvas are different things. Use a content-resource creator for a thumbnail, rendering, or body; use an annotation creator when you need a target, motivation, and body assembled together.

| Task | Exported definitions |
| --- | --- |
| Image URL or IIIF Image API service | `imageUrlCreator`, `imageServiceCreator` |
| Paint images on a Canvas | `imageUrlAnnotation`, `imageServiceAnnotation`, `captionedImageAnnotation` |
| Multiple image URLs | `imageUrlListCreator`, `imageUrlListAnnotation` |
| Audio/video annotations | `audioAnnotation`, `videoAnnotation` |
| HTML, text links, web pages, YouTube | `htmlBodyCreator`, `htmlAnnotation`, `plaintextCreator`, `webPageCreator`, `youTubeBodyCreator` |
| Empty structure | `emptyCanvas`, `emptyAnnotationPage` |
| Ranges/table of contents | `rangeTopLevel`, `rangeWithItems` |
| Providers and manifests | `providerCreator`, `manifestBrowserCreator` |

Definitions carry their own `supports` rules. A creator appearing in this table does not mean it is valid for every parent property. Use each definition's `id` rather than guessing registration strings from its export name. `allCreators` is the standard list; it is not every exported definition (`manifestBrowserCreator`, for example, is deliberately separate).

## Create a Canvas programmatically

```ts
import { Vault } from "@iiif/helpers";
import { Creator } from "@manifest-editor/creator-api";
import { emptyCanvas } from "@manifest-editor/creators";

const vault = new Vault();
const id = "https://example.org/manifest";
await vault.loadManifest(id, {
  id, type: "Manifest", label: { en: ["My manifest"] }, items: [],
});
const creator = new Creator(vault, [emptyCanvas]);
await creator.create(emptyCanvas.id, {
  label: { en: ["Page one"] }, width: 1200, height: 1800,
}, {
  parent: { resource: { id, type: "Manifest" }, property: "items" },
});
const json = vault.toPresentation3({ id, type: "Manifest" });
console.log(json);
```

Install `@manifest-editor/creator-api` and `@iiif/helpers` alongside this package for this example. `emptyCanvas` creates its empty AnnotationPage as well as the Canvas. The creator runtime imports both and adds the Canvas reference to the Manifest's `items`.

## Register a smaller creation menu

A preset can export a curated `creators` array instead of `allCreators`. Include any definitions required by nested `ctx.create()` calls as well as the definitions you intend to show. Selection is contextual: supported parent fields/types and resource recognition determine which choices are offered.

For forms with a useful default, adapt a definition rather than forking its UI:

```ts
import { withInitialData } from "@manifest-editor/creator-api";
import { imageUrlCreator } from "@manifest-editor/creators";

export const creators = [withInitialData(imageUrlCreator, {
  url: "https://example.org/cover.jpg",
})];
```

The prefilled URL is form initial data. A direct `Creator.create()` call still needs its own payload.

## Reuse creation logic

Many definitions export their underlying creation functions and payload types, such as `createPlaintext` and `CreatePlaintextPayload`. Those functions take a payload **and** a `CreatorFunctionContext`; they are building blocks for another creator, not standalone Vault mutation functions. Use `Creator.create()` when you want the complete import/link/commit behavior.

See the [creator API guide](../creator-api) for custom definitions, nested creation, parent constraints, selectors, and the difference between render and execution contexts. Resource and annotation helpers may fetch external URLs; the host must allow those requests and handle failures from `create()`.

## API overview

- `allCreators`: the standard creator definition list.
- Individual definitions such as `imageUrlCreator`, `imageServiceCreator`, `emptyCanvas`, `audioAnnotation`, `videoAnnotation`, `rangeTopLevel`, and `providerCreator`.
- Creation helpers exported alongside the definitions.
- `manifestBrowserCreator` is exported separately and is not included in `allCreators`.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/creators/src) for the complete API and TypeScript definitions.

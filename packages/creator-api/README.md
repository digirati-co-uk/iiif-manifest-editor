<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/creator-api"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fcreator-api" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/creator-api

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Definitions and execution support for resource creators. A creator combines supported parent/resource types, creation logic, and an optional React form.

## Quick start

```sh
npm install @manifest-editor/creator-api @manifest-editor/creators
```

```ts
import { withInitialData } from "@manifest-editor/creator-api";
import { imageUrlCreator } from "@manifest-editor/creators";

export const prefilledImageCreator = withInitialData(imageUrlCreator, {
  url: "https://example.org/image.jpg",
});
```

Register the resulting definition in a custom preset’s `creators` array. This example configures a form; it does not create a resource until the creator is run.

## Creation has two parts

A **definition** describes what can be created and where it is allowed. Its `render(ctx)` callback, when present, shows a form in the editor. The form calls `ctx.runCreate(payload)` when the user submits. Its separate `create(payload, ctx)` function builds the resources, so the same logic can be invoked programmatically without rendering the form.

The distinction matters: the render context and creation-function context are different types. `CreatorContext` supplies UI actions; `CreatorFunctionContext` supplies composition helpers, the Vault, parent/target information, and ID generation.

### What a definition describes

| Field | Purpose |
| --- | --- |
| `id`, `label`, `summary`, `icon` | Registration and the creator picker. |
| `resourceType`, `resourceFields` | The kind of resource produced and its fields. |
| `supports` | Allowed parent types/properties, optional field maps, and custom eligibility checks. |
| `create` | Build one resource or an array of resources from a payload. |
| `render` | Optional React form. |
| `supportsResource` | Recognise supplied content, such as a URL, and offer an appropriate creator. |
| `sideEffects` | Follow-up actions after creation into a parent. |

`defineCreator()` preserves the definition's TypeScript information; it does not register or execute it. Pass definitions to `Creator` or register them in a shell preset. Keep IDs unique.

## Define and run a creator

This headless example creates a Canvas and its AnnotationPage together, then links the Canvas to a Manifest:

```ts
import { Vault } from "@iiif/helpers";
import { Creator, defineCreator } from "@manifest-editor/creator-api";

const blankCanvas = defineCreator({
  id: "example/blank-canvas",
  label: "Blank canvas",
  resourceType: "Canvas",
  resourceFields: ["id", "type", "label", "width", "height", "items"],
  supports: { parentTypes: ["Manifest"], parentFields: ["items"] },
  create(data: { title: string }, ctx) {
    const id = ctx.generateId("canvas");
    const page = ctx.embed({
      id: `${id}/page`, type: "AnnotationPage", items: [],
    });
    return {
      id, type: "Canvas", label: { en: [data.title] },
      width: 1000, height: 1000, items: [page],
    };
  },
});

const vault = new Vault();
const id = "https://example.org/manifest";
await vault.loadManifest(id, {
  id, type: "Manifest", label: { en: ["Example"] }, items: [],
});
const creator = new Creator(vault, [blankCanvas]);
const reference = await creator.create(blankCanvas.id, { title: "Page one" }, {
  parent: { resource: { id, type: "Manifest" }, property: "items" },
});
console.log(reference, vault.toPresentation3({ id, type: "Manifest" }));
```

Install `@iiif/helpers` as well to run this example. `create()` returns a reference or array of references, not the original nested JSON. With a parent, it checks supported types and fields, imports the new resources, and links them into that parent's property. `start` and `target` are handled as single references; list properties use reference insertion, optionally at `parent.atIndex`.

Without a parent, creation still imports the resources but does not attach them to another resource. Supply `rootId` when your definition calls `ctx.generateId()` without a parent; otherwise it has no meaningful base identifier. Definition side effects run only when a parent is supplied.

## Compose resources instead of duplicating them

Inside a creation function:

- `ctx.embed(data)` wraps a new resource for inclusion in the result graph.
- `ctx.ref(idOrReference)` refers to an existing resource; it does not fetch that resource.
- `await ctx.create(id, payload, options?)` invokes another registered creator and returns its resource wrapper(s). Nested creation is collected into the outer commit rather than committing immediately.
- `ctx.generateId(type, parent?)` builds an ID beneath a parent or configured root.
- `ctx.getParent()`, `ctx.getTarget()`, and selector helpers preserve the distinction between a source resource and a targeted region.
- `ctx.getPreviewVault()` provides the separate preview Vault.

`CreatorResource` keeps embedded resources and references separate while producing normalised Vault entities. Its `get()` returns the working resource; `ref()` produces a reference, preserving a `SpecificResource` wrapper when present. Prefer these helpers for explicit composition even though the implementation can also process nested resource objects.

## Adapt the built-in forms

`withInitialData(definition, defaults, overrides?)` merges form defaults with invocation-specific initial data; the third argument wins over both. `withCustomRender(definition, render)` receives the current context and original renderer so you can wrap a form. Both return definitions for registration; neither runs creation.

The built-in definitions live in [`@manifest-editor/creators`](../creators). Typed definitions help authors, but the runtime `Creator.create(id, payload, options)` method still accepts an untyped payload. The fully inferred `useCreator(resource, property, id)` API shown in older design notes is not available.

## API overview

- `Creator` and `CreatorResource`: creation execution and resource composition.
- `defineCreator`: typed creator definitions.
- `withInitialData`: supplies defaults to a creator form.
- `withCustomRender`: wraps or replaces a creator's UI.
- Creator context, payload, supported-parent, and resource types.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/creator-api/src) for the complete API and TypeScript definitions.

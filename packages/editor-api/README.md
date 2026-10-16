<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/editor-api"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Feditor-api" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/editor-api

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

The framework-independent editing layer over an IIIF Vault. It groups property operations into descriptive, technical, linking, and structural editors.

## Quick start

```sh
npm install @manifest-editor/editor-api @iiif/helpers
```

```ts
import { Vault } from "@iiif/helpers";
import { Editor } from "@manifest-editor/editor-api";

const vault = new Vault();
const manifest = await vault.loadManifest("https://wellcomelibrary.org/iiif/b18035723/manifest");
if (!manifest) throw new Error("Manifest could not be loaded");
const editor = new Editor(vault);
const instance = editor.edit({ id: manifest.id, type: "Manifest" });
instance.descriptive.label.set({ en: ["My edited manifest"] });
const json = vault.toPresentation3(manifest);
```

Edits update the Vault. Serialize and persist the resulting manifest explicitly; this package does not save it to a server.

## How editing works

The Vault stores a normalised IIIF graph. `Editor` wraps that Vault, and `editor.edit(reference, config?)` creates an editing view of one resource. Property editors dispatch Vault actions rather than mutating the JSON object you originally loaded. Export through `vault.toPresentation3()` when you need a nested IIIF document again.

This package handles data operations. React forms and tab definitions live in [`@manifest-editor/editors`](../editors); panel selection and editing context live in [`@manifest-editor/shell`](../shell). New resources are created through [`@manifest-editor/creator-api`](../creator-api).

### Property groups

| Member on `EditorInstance` | Responsibility |
| --- | --- |
| `descriptive` | Language maps, labels, summaries, metadata, thumbnails, and other descriptive properties. |
| `technical` | Technical fields such as dimensions and behavior. |
| `linking` | Links to related resources. |
| `structural` | Resource lists such as `items`. |
| `metadata` | Alias for the descriptive metadata editor. |
| `extensions` | Supported extension properties. |
| `annotation` | Annotation-specific operations; initialised for Annotation resources. |
| `context` | Optional operations on this resource's reference within its parent. |

Use properties supported by the current resource type. `required`, `recommended`, `optional`, `notAllowed`, and `allowed` expose resource metadata; they are not a guarantee that the current resource is valid.

## Language maps and metadata

After creating `instance` in the quick start:

```ts
const label = instance.descriptive.label;
const currentLabel = label.get();
label.set({ en: ["New title"], fr: ["Nouveau titre"] });
label.setValueForLanguage("en", "Revised title");

instance.metadata.add({ en: ["Creator"] }, { none: ["Example institution"] });
// Metadata is ordered; update and delete use an index.
instance.metadata.update(0, { en: ["Creator"] }, { none: ["Updated institution"] });
```

`get()` participates in dependency tracking. `getWithoutTracking()` reads the same value without registering the property with the instance's observer. `focusId()`, `containerId()`, and `getContainerProps()` help a UI associate controls with an edited resource/property.

## Observe changes

A component can track only the properties it reads and unsubscribe when it is disposed:

```ts
instance.observe.reset();
instance.descriptive.label.get();
instance.descriptive.summary.get();
const unsubscribe = instance.observe.start(() => {
  console.log("A tracked property changed");
});

// During teardown:
unsubscribe();
```

`instance.observe.subscribe(callback)` observes the resource as a whole and also returns an unsubscribe function. A property has `observe(callback, skipInitial?)`, but its current wrapper does **not** return the underlying unsubscribe function; prefer the instance observer when you need explicit subscription cleanup. The historical `label.subscribe()` and `observe.begin()` examples are not the current API.

## Structural lists and parent references

List editors operate on references. Load or create a resource in the Vault before linking it into a list. Reordering changes the parent's list; it does not recreate the child resources.

```ts
const items = instance.structural.items;
const canvases = items.get();
if (canvases.length > 1) {
  items.reorder(0, 1);
}
```

Available list operations include `add`, `addBefore`, `addAfter`, `deleteAtIndex`, `empty`, `reorder`, `moveToStart`, `moveToEnd`, `moveUpBy`, `moveDownBy`, and `updateReference`. `get()` returns the list; use normal array access for an individual item. Generic `set()` is not implemented for reference lists—use the list operations.

For operations on a child in its parent, supply the current parent property and index:

```ts
const first = instance.structural.items.get()[0];
if (first) {
  const canvasEditor = editor.edit(first, {
    context: {
      resource: { type: "SpecificResource", source: first },
      parent: instance.ref(),
      parentProperty: "items",
      index: 0,
    },
  });
  canvasEditor.context?.moveToEnd();
}
```

`context` also exposes `removeFromParent`, `addBefore`, `addAfter`, `getSelector`, and `updateReference`. A selector belongs to the contextual `SpecificResource` reference, not necessarily to the source Canvas itself. Update that wrapper with `updateReference` when changing its selector. Recreate contextual editors after external list edits so their stored indexes remain accurate.

## Validation and IIIF property guidance

Pass validators to `edit`, not to the `Editor` constructor. Validators inspect the current resource; they do not block writes automatically.

```ts
const checked = editor.edit(instance.ref(), {
  validators: [{
    types: ["Manifest"],
    properties: ["label"],
    message: "An English title is required for this project",
    error: true,
    warning: false,
    valid: (resource) => Boolean(resource.label?.en?.some((value: string) => value.trim())),
  }],
});
const result = checked.descriptive.label.validate();
console.log(result.isError, result.errors);
```

Property validation returns `isError`, `isWarning`, `errors`, and `warnings`; instance validation aggregates problems for the resource. This is not a complete IIIF conformance validator. Property definitions and documentation are also exported as static metadata from `meta/*`; the old instance-level `documentation.getLink()` design is not implemented.

## API overview

- `Editor`: binds editing operations to a Vault; `edit(reference, config?)` creates an `EditorInstance`.
- `EditorInstance`: grouped resource properties and resource/context helpers.
- `BasePropertyEditor`, `InternationalStringEditor`, `MetadataEditor`: property reads, writes, and specialised editing operations.
- `BaseReferenceListEditor`: editing linked resource lists.
- Property metadata, resource definitions, configuration types, and box-style helpers.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/editor-api/src) for the complete API and TypeScript definitions.

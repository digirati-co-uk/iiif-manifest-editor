# Creators

## API Design

The current API is a pain to use. Its lacking types.

Essentially this is the current creator hook/API (with no types!).

```ts
creator.create("@manifest-editor/image-url-creator", newThumbnail, {
  targetType: "ContentResource",
  parent: {
    property: "thumbnail",
    resource: {
      id: collection!.id,
      type: "Collection",
    },
  },
  initialData: {},
});
```

Ideally something like this would work, and be type-safe.

```tsx

const resource = { id: ..., type: 'Manifest' }; // Maybe from props or something.
const createImage = useCreator(
  // Resource will have a type.
  resource,
  // This should be inferred from the resource type + supported fields.
  "thumbnail",
  // This should be inferred from the resource type + property supported type.
  "@manifest-editor/image-url-creator"
);

// ...
createImage({ url: 'https://example.org/image.jpg' });
```

The same thing, but on the editor API.

```ts
const manifestEditor = useManifestEditor();

await manifestEditor.descriptive.thumbnail.create("@manifest-editor/image-url-creator", {
  url: "https://example.org/image.jpg",
});
```

# Creator API

- What do you want to create
  - The type + refined type
  - The fields you add
  - Static fields
- Where is it valid to create
  - Parent type
  - Custom parent supports
  - Parent fields
- Canvas specific: how does it affect the canvas
  - temporal
  - spatial
- What can it export as:
  - Canvas
  - Annotation
  - Resource
- Other
  - Does it replace resources? (e.g. choice)
  - Does it require canvas interaction

Examples (cookbook)

- Simple image
- Simple audio
- Simple video
- Image with service
- Cropped image (with service)
- External HTML link
- External PDF
- External XML
- External plaintext?
- Commenting annotation on canvas
- Tagging annotation at box
- Creating range from canvas selection?
- Creating choice from list of annotations

The creation process is split into two parts:

- The UI (e.g. the form that's presented to the user)
- The building/creation process

The creation process is intended to be dual purpose. This is not a great example, but here you can see that you can "call" other creators inside this creator. So they can become composable.

```ts
async function createThing(ctx) {
  const image = await ctx.create("@manifest-editor/create-image", {
    url: "https://example.org/image-1.jpg",
  });

  // If you want the underlying resource you just created.
  const previewResource = image.get();

  // Find a reference to an existing resource.
  const ref = ctx.ref("https://example.org/canvas-1");

  // Or you can create new resources that will be embedded.
  const image2 = ctx.embed({
    id: "https://example.org/image-2.jpg",
    type: "Image",
    height: 100,
    width: 200,
  });

  // And then it can be part of a bigger resource:
  // This cannot be a nested tree - it must be a flat resource with linked resources (like thumbnail) as
  // objects like `ctx.create()` or `ctx.embed()`. This makes sure that we can piece together the finaly
  // actions required in the last step.
  return {
    id: "https://example.org/image-3.jpg",
    type: "Image",
    height: ctx.data.height,
    width: ctx.data.width,
    thumbnail: [image],
  };
}
```

A "create" callback will be passed to the render, this is when this will be called and the resource will be created. Once created `edit()` will be called on the resource.

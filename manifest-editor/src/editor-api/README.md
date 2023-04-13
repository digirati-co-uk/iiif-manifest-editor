# Editor API

Everything that happens in the Manifest Editor is an editing operation on an instance of the Vault on one or more resources. There are also "creation" steps.

This directory will try to bring structure to this whole process. There will be 2 types of helpers:
- Editors
- Factories

## Editors

List of existing "editors"

- Manifest descriptive
- Manifest metadata
- Manifest linking
- Manifest technical
- Canvas descriptive
- Canvas metadata
- Canvas media
- Canvas technical
- Edit media item
- Canvas thumbnail list/grid

```ts
const editors = {
  label: 'Media editor',
  resourceType: 'Canvas',
  tabs: true,
  editors: [
    {
      label: 'Media editior',
      hideFromTabs: true,
      supports: (ctx) => true, // Supports all.
      renderEditor: renderMediaEditor,
    }
  ],
  
}
```

The boilerplate editor code will handle the direct saving of the resource and provide the
apis for mutating. For example, the boilerplate will handle SpecificResource issues and
if there is a target that is available to edit. Also handle saving back to the parent.

Editors will be automatically selected from this list. Anywhere in the application you will be able to run: `edit(resource)` and it will open the right panel with the correct editor. 

## Factories

List of existing (proto) factories.

- Add new media
- Add new canvas

The properties of a factory:

- A configuration describing how to create a resource
- Contains a pointer to the target type + property
- Has a list of options for each property (reusable)

```ts
const newCanvas = {
  label: 'Add new canvas',
  property: 'items',
  targetType: 'Manifest',
  editors: [], // Otherwise defaults will be used.
  creators: [
    {
      label: 'Blank canvas',
      outputType: 'Canvas',
      form: {
        width: { type: 'number-field', defaultValue: 1000 },
        height: { type: 'number-field', defaultValue: 1000 },
      },
      renderForm: renderBlankCanvas,
      creator: createBlankCanvas,
    }
  ]
};
```

`renderForm` - Takes in `form`, presents to the user and calls `creator`.

From anywhere in the app you will be able to run: `create('Canvas', 'Manifest', 'items')` - the user will then be presented with the UI to make a choice. Alternatively `createModal(...)` will open outside the right panel. 

The reusable part built here will do the following:

- Take the output of `createBlankCanvas`
  - Add dependencies (new nested resources) to Vault
  - Add the original resource to Vault
  - Link the resource to the specified property

```ts
const vault = new Vault();

const builder = new IIIFBuilder(vault);

const editor = new IIIFEditor(vault);

const {
  // Editors
  technical,
  descriptive,
  metadata,
  linking,
  structural,

  // Reference
  position,
  selector,

  // Extra helpers
  isMultiple,
  required,
  recommended,
  documentation,
  validate,
  observe,
} = editor.createEditor(referenceOrResource, context);
```

## Editing + observing properties

```ts
const { descriptive, structural, observe } = editor.createEditor(referenceOrResource, context);

const { label, summary } = descriptive;

label.get(); // Returns value.
label.set(newValue); // Sets new value.
label.subscribe(() => {}); // Subscribe to changes to the label
label.focusId(); // Unique identifier for focus states
label.isValid(); // If it passes validation rules
label.errors; // list of errors
label.warnings; // list of warnings

observe.subscribe(() => {}); // Subscribe to all changes
observe.begin(); // Begin a snapshot.

label.get(); // Indicates that label should be observed.
summary.get(); // Indicates that the summary should be observed.

const { items } = structural;

items.get(); // all
items.get(index); // at index
items.length; // size of items
items.editor(items.get(0)); // Return new editor instance
items.generateReference(items.get(0)); // Full configuration (parent/index) for item.
```

## Position changes

```ts
const { position } = editor.createEditor(ref, { parent, index: 1 });

if (position) {
  position.moveUp(); // optionally by number
  position.moveDown(); // optionally by number
  position.moveToStart();
  position.moveToEnd();
  position.moveBeforeIndex(idx);
}
```

## Selector changes

```ts
const { selector } = editor.createEditor(ref, { parent, index });

selector.hasValid(); // Already has
selector.get();
selector.getRaw();
selector.set(newValue);
selector.subscribe(() => {});
```

## Extra

```ts
const { documentation, required, recommended, validate } = editor.createEditor(ref);

// @note - documentation now split out into it's own static thing.
documentation.getLink("label");
documentation.getSummary("label");

recommended.includes("label"); // Array of recommended properties
required.includes("id"); // Array of required properties

const [isValid, warnings] = validate.label(proposedNewValue); // Validation for proposed new value
```

## Validation rules

```ts
const editor = new IIIFEditor(vault, {
  validators: [
    {
      types: ["Canvas"],
      properties: ["duration", "height", "width"],
      message: "All canvases must have a duration or height and width",
      error: true,
      warning: false,
      valid: (canvas) => canvas.duration || (canvas.width && canvas.height),
    },
  ],
});
```

## Code

Supported / required

```ts
const supportedDescriptive = {
  Manifest: ["label", "summary"],
  Canvas: ["label", "summary"],
};

const requiredDescriptive = {
  Manifest: ["label"],
};
```

Documentation links:

```ts
const rootDocumentation = "https://iiif.io/api/presentation/3.0/";
const documentationProperties = {
  label: "#label",
};
```

Documentation summary:

```ts
const documentationSummary = {
  label: `A human readable label, name or title. The label property is intended to be displayed as a short, textual surrogate for the resource if a human needs to make a distinction between it and similar resources, for example between objects, pages, or options for a choice of images to display. The label property can be fully internationalized, and each language can have multiple values.`,
};
```

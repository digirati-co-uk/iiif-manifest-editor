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


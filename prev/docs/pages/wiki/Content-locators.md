A content locator is a slice of a IIIF document. It can be thought of as a IIIF Content state + list of one or more fields. A content locator is only of the only data structures that lives outside of the Vault. It is used only to drive the state of the UI and interaction design.

Goals:
* Select any slice of IIIF content to the lowest possible granularity.
* Resolvable in the current Vault (with partOf if required)
* Serialisable and portable - possibly across ME instances in the future

### Examples of content locators.


#### Full manifest
```json
{
  "id": "https://example.org/manifest",
  "type": "Manifest"
}
```

#### Canvas
```json
{
  "id": "https://example.org/manifest",
  "type": "Manifest"
}
```

#### Single field on Manifest
```json
{
  "id": "https://example.org/manifest",
  "type": "Manifest",
  "fields": ["label"]
}
```

#### Multiple fields on Manifest
```json
{
  "id": "https://example.org/manifest",
  "type": "Manifest",
  "fields": ["label", "summary"]
}
```

#### Metadata on Manifest
Metadata is both ordered, but also non-identifiable and as a result the whole metadata must be edited at once. If a widget held a lock on `metadata[2].label`, another widget could reorder elements around it, breaking the `[2]` reference. A more complex implementation may lock metadata ordering when any metadata item was locked - but this is out of scope.

```json
{
  "id": "https://example.org/manifest",
  "type": "Manifest",
  "fields": ["metadata"]
}
```


## Copy + paste
When a user focuses on an element, like a canvas thumbnail in a list, and copies to their clipboard, we can hi-jack this and send a content locator instead.

```js
thumbnail.addEventListener('copy', (e) => {
  e.preventDefault();
  e.clipboardData.setData(
    'text/plain', 
    '{"id": "https://example.org/canvas-1", "type": "Canvas"}' // could also have { "fields": ["thumbnail"] }
  );
});
```

This would allow a paste action to happen in another area of the editor. The paste target may choose to use all, some or none of the data in the locator.
```js
target.addEventListener('paste', (e) => {
  const json = (e.clipboardData || window.clipboardData).getData('text');
  const locator = JSON.parse(json);

  // ... Do something with locator.
});
```


## Widgets

[Widgets](Extending-Manifest-Editor.md#widgets---technical-overview) will also use content locators to instantiate. Pin-pointing which piece of state to edit. This standardisation of content descriptions would allow for contextual actions to be taken, similar to copy and paste.

A popup could hold an arbitrary widget, created through a contextual menu:

- open in...
   - Widget A
   - Widget B

Where instead of highlighting an object and copying and pasting it, you could right-click and see the options above. For power-users this will allow them to use any of the configurations or flavours of the manifest editor while still having access to their favourite widgets that may need for very specific fields.

## Tray

The tray could be modelled as a list of content locators. These may be resources inside of the vault, but may also be remote:
```json
{
  "id": "https://example.org/some-image-annotation",
  "type": "Annotation",
  "partOf": {
    "id": "https://example.org/manifest-1",
    "type": "Manifest"
  }
}
```
This would require a part of statement. 


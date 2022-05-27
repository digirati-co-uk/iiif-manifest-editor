# Shell


## App context

### useApps()

* Get current app
* Change app
* List all apps 

```js
const { currentApp, apps, changeApp } = useApps();

// All app information.
apps['manifest-editor'];

// Current app
currentApp.id;

// Change app
changeApp({ id: 'manifest-editor' });

// Change app with argument (launcher)
changeApp({ id: 'collection-explorer', args: 'https://example.org/collection-123' });
```

### useAppState()
Global app state, currently only used for `canvasId`.
* Get global state
* Set global state

```js
const appState = useAppState();

// Setting
appState.setState({ canvasId: 'https://example.org/canvas-1' })

// Getting
appState.state.canvasId;

```

## Config context

```js
const config = useConfig();


// Languages for the editor ['en, 'none']
config.defaultLanguages;

// Behaviours string[]
config.behaviorPresets;

// IIIF collection for templates
config.newTemplates;
  
// List of previews.
config.previews;
```

## Layout
* Get available layouts in app
* Get layout state
* Get layout actions


### Available layouts
```js
const layouts = useAvailableLayouts();

// Loading status, check before listing.
layouts.loading;

// List of left panels.
layouts.leftPanels;

// List of center panels.
layouts.centerPanels;

// List of right panels
layouts.rightPanels;
```

### Get layout state
```js
const { 
  leftPanel, 
  rightPanel, 
  pinnedRightPanel, 
  centerPanel,
} = useLayoutState();

// Following are the same for all.

// Panel state (defined by app)
leftPanel.state;

// Current identifier for panel
leftPanel.current;

// If the panel is open or not.
leftPanel.open;

// If the panel is minimised (not yet implemented)
leftPanel.minimised;

// Custom width of panel, if set.
leftPanel.customWidth;

// Only for pinned:

// Can this be pinned;
pinnedRightPanel.pinnable;

// Is this pinned?
pinnedRightPanel.pinned;
```

### Get layout actions
```js
const actions = useLayoutActions();

// Open a panel
actions.open('manifest-properties');
actions.open('manifest-properties', { some: 'state' });

// Change a panels state (does not open)
actions.change('canvas-properties', { tab: 2 });

// Close panel
actions.close('canvas-properties');

// Toggle panel
actions.toggle('canvas-properties');


// Same actions as above are available PER panel
actions.leftPanel;
actions.rightPanel;
actions.centerPanel;

// And some additional on each:
actions.leftPanel.resetSize();
actions.leftPanel.setCustomWidth(450);
actions.leftPanel.maximise(); // N/A
actions.leftPanel.minimise(); // N/A
```


## Preview Context
* Get selected preview
* Get all activated previews
* List all configurations and their class handlers
* Activate, select and focus previews
* Delete previews from storage
* Update all existing previews (vault -> external)

```js
const preview = usePreviewContext();

// Which preview is selected.
preview.selected;

// List of active preview ids
preview.active;

// List of all available preview configurations
preview.configs;

// List of all available config classes.
preview.handlers;

// And actions
preview.actions.activatePreview('universal-viewer');
preview.actions.selectPreview('universal-viewer');
preview.actions.deletePreview('universal-viewer');
preview.actions.focusPreview('universal-viewer');
preview.actions.updatePreviews();
```

## Project context
* Create project (then select automatically)
* List all recent projects
* Select a project to work on


### useProjectCreators()
```js
const { createProjectFromManifestId, createBlankManifest } = useProjectCreators();

// Create and select a blank manifest
await createBlankManifest();

// Create a new project from external manifest id
await createProjectFromManifestId('https://example.org/manifest');
```

### useProjectContext()
```js
const ctx = useProjectContext();

// Loading status (projects can be loaded from network)
ctx.loadingStatus.loading;
ctx.loadingStatus.loaded;
ctx.loadingStatus.lastLoaded; // time.

// Current proejct details (same for listing)
ctx.current;
ctx.current.name;
ctx.current.thumbnail; // Optional
ctx.current.previews; // list of previews
ctx.current.resource.id; // Top level resource {id, type: Manifest}
ctx.current.storage; // Configured storage for project
ctx.current.settings; // Unused, future settings
ctx.current.filename; // File name (unused)
ctx.current.publications; // Future publish options
ctx.current.metadata.modified; // Last modified
ctx.current.metadata.created; // Created at

// List of all projects
ctx.allProjects; 

// Actions
ctx.actions.switchProject('some-project-id');
ctx.actions.createProject({ ... });
ctx.actions.deselectProject('some-project-id')
ctx.actions.saveProject({ ... });
ctx.actions.updateThumbnail('...');
ctx.actions.updateDetails({name: '..', filename: '..'});
ctx.actions.updateSettings({ ... });

// More internal actions
ctx.actions.createPublication({ ... }); // unused
ctx.actions.removePublication('publication-id');
ctx.actions.updatePublication({ ... });
ctx.actions.updateStorage({ ... });
ctx.actions.setLoadingStatus({ ... })
ctx.actions.load({ ...  });
```

## Resource editing context

Simple Context/hook combo

Top level:

```jsx
const anno = { id: 'https://e.org/anno-1', type: 'Annotation' }

<ResourceEditingProvider resource={anno}>
  <MyGenericEditor />
</ResourceEditingProvider>
```

And then inside the generic editor

```typescript
import {
  DescriptiveProperties
} from "@iiif/presentation-3";

function MyGenericEditor() {

  // You can narrow with typescript
  const resource = useResource<DescriptiveProperties>();

  // Although technical properties, the "ref" is always 
  // merged with the type.
  resource.id
  resource.type
  resource.label
  resource.summary
  // ...

}
```

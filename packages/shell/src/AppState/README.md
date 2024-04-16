# App State

This is the replacement for the old model of handling resources and apps.

The Manifest Editor will no longer handle:

- Multiple apps
- Switching apps
- Matching apps to their content types
- Loading IIIF
- Handling Save

This makes the Manifest Editor itself more composable.

The app state will hold:

- IIIF Resource
- Event emitter (saving, loading, etc.)
- Vault (passed when the IIIF resource is passed)
- The current App (full implementation)

All contexts will be immutable and never change, so it's simply to avoid prop-drilling. It will change if the resource changes, but in that case we should do a full re-mount.

Current hooks provided that will need to be replicated:

- `useApps()` - deprecated, will return `[currentApp]`
- `useProjectCreators()` - may need to be replaced with an event model, or all components delegated outside
- `createProject` - moved outside of ME responsibility
- `deleteProject` - moved outside of ME responsibility
- `switchProject` - moved outside of ME responsibility
- `saveProject` - moved to an event on the bus
- `updateDetails` - moved to an event on the bus
- `setPreview` - needs reworked, the preview can still be created in the ME.
- `useCurrentProject()` -
- `useProjectContext` - moved outside of the ME responsibility

So we should create a new package: `@manifest-editor/projects` that will hold the existing implementation of projects
and use the NEW API. This will allow a completely compatible model and a place for us to put that existing code.

It will be a mix of code and UI:

- Header with project updating
- Menu items with new/save/open
- A set of components + hooks for building a project interface (Context + hooks)

Additionally, the new ME will need some new hooks for:

- Header customisation
- Menu building based on context

<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/shell"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fshell" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/shell

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Application composition, state, layouts, plugins, configuration, and background tasks. Use this lower-level package when you need to assemble a custom editor beyond the combined component.

## Quick start

```sh
npm install manifest-editor @manifest-editor/shell @manifest-editor/manifest-preset @iiif/helpers react-iiif-vault react@19 react-dom@19
```

```tsx
import { AppProvider, Layout, PluginProvider, ShellProvider, mapApp } from "@manifest-editor/shell";
import * as manifestPreset from "@manifest-editor/manifest-preset";
import { VaultProvider } from "react-iiif-vault";
import { Vault } from "@iiif/helpers";
import "manifest-editor/index.css";

const app = mapApp(manifestPreset);
const vault = new Vault();
const manifest = await vault.loadManifest("https://wellcomelibrary.org/iiif/b18035723/manifest");
if (!manifest) throw new Error("Manifest could not be loaded");
const resource = { id: manifest.id, type: "Manifest" as const };

export function CustomEditor() {
  return (
    <PluginProvider plugins={manifestPreset.plugins}>
      <AppProvider appId={app.metadata.id} definition={app} instanceId="my-editor">
        <VaultProvider vault={vault}>
          <ShellProvider resource={resource}>
            <Layout />
          </ShellProvider>
        </VaultProvider>
      </AppProvider>
    </PluginProvider>
  );
}
```

This browser-side example loads the manifest before mounting. Use a client-only entry point in applications with server rendering. The provider nesting is deliberate.

## What the shell owns

The shell connects a preset's UI definitions to a loaded IIIF resource. It owns panel state, editing selection, creator/editor dispatch, configuration, previews, plugins, and background work. It does not replace the Vault and does not itself implement a project-storage service.

| Layer | Responsibility |
| --- | --- |
| `PluginProvider` | Available plugin modules, enable/disable state, and global plugin settings. |
| `AppProvider` | One mapped app definition, metadata, instance identity, and app-local state. |
| `MultiAppProvider` | Optional app registry and switching; supplies the selected app through `AppProvider`. |
| `VaultProvider` from `react-iiif-vault` | Loaded IIIF data and subscriptions. |
| `ShellProvider` | The active root resource and the editing/layout/configuration contexts. |
| `Layout` | Renders the selected panels and supporting UI. |

The quick start shows a single app. Keep providers and Vault instances stable when adding controls inside it. A hook that reads a provider's context must run below that provider.

## Define or extend an app

An app module supplies default metadata plus panel, editor, creator, and background definitions. `mapApp(module)` turns that into a `MappedApp` with `metadata`, `layout`, and optional configuration/preset data. Already mapped presets, such as `collectionPreset`, can be passed directly to `AppProvider`.

`extendApp` is the composition helper used by the exhibition preset to reuse manifest editing while adding or replacing layout and configuration. The [exhibition preset source](../../presets/exhibition-preset/src/index.tsx) is a concrete example. Panel IDs are registration keys; actions must refer to an ID actually included in the active app.

### A custom panel

```tsx
import type { LayoutPanel } from "@manifest-editor/shell";

export const notesPanel: LayoutPanel = {
  id: "example-notes",
  label: "Notes",
  render: () => <p>Instructions for this editing workflow.</p>,
};
```

Add this definition to the app module's `leftPanels`, `rightPanels`, or `centerPanels` before mapping it. Defining a panel does not automatically select/open it.

## App selection and app-local state

`useApps()` requires `MultiAppProvider`. It returns `apps`, `currentApp`, `initialApp`, `changeApp`, and `changeProjectType`. `apps` is keyed by app ID; switching can carry arguments:

```tsx
import { useApps } from "@manifest-editor/shell";

export function SwitchToManifestEditor() {
  const { changeApp } = useApps();
  return <button onClick={() => changeApp({ id: "manifest-editor" })}>Manifest editor</button>;
}
```

`useApp()` reads the current mapped definition. `useAppInstance()` reads instance identity. `useAppState<T>()` exposes `state` and `setState` for application-local state; keep that separate from IIIF resource data in the Vault. The old `canvasId` example was an app convention, not the full scope of this store.

## Configuration

`useConfig()` exposes the merged editor configuration. `useSaveConfig()` supplies the persistence/update callback used by configuration controls. A host passes `config` and `saveConfig` into `ShellProvider` (or the combined `ManifestEditor`).

Useful configuration areas include:

| Key | Purpose |
| --- | --- |
| `i18n` | Default/available languages and advanced language editing. |
| `editorConfig` | Per-resource editor settings, including hidden tabs. |
| `editorFeatureFlags` | Canvas/media and interface options. |
| `creators` | Configuration for individual creators. |
| `previews`, `defaultPreview` | Available viewers and the preferred preview. |
| `behaviorPresets`, `newTemplates` | Editing guidance and resource templates. |
| `export` | Serialization version and identifier options. |
| `plugins` | Per-editor plugin configuration. |
| `urlState` | Host adapters for reading and replacing URL search parameters. |

The `Config` type is the authoritative list. It is separate from the lower-level `EditorConfig` in `@manifest-editor/editor-api`, which controls an individual editing operation.

## Layout state and actions

`useAvailableLayouts()` returns panel definitions and optional loading state. `useLayoutState()` returns `leftPanel`, `centerPanel`, `rightPanel`, `pinnedRightPanel`, and `modal`. Each slot tracks `current`, `state`, `open`, `minimised`, `customWidth`, and a stack; the pinned slot also records pinning state.

```tsx
import { useLayoutActions, useLayoutState } from "@manifest-editor/shell";

export function PanelControls() {
  const actions = useLayoutActions();
  const { rightPanel } = useLayoutState();
  return (
    <button onClick={() => actions.rightPanel.close()} disabled={!rightPanel.open}>
      Close inspector
    </button>
  );
}
```

Actions on registered panel IDs include `open(id, state?)`, `change(id, state?)`, `close(id)`, `toggle(id)`, and `stack(id, state?)`. Object overloads allow explicit stacking/state options. Per-slot actions such as `actions.leftPanel.open({ id, state })` use object arguments; they are not identical to the ID-based top-level helpers. Slots also expose resize, minimise/maximise, and stack navigation operations; the pinned slot adds `pin`/`unpin`.

`actions.edit(reference, context?, options?)` routes a resource to the editor UI, with options for a property, selected tab, stacking, or forced opening. `actions.create(creatableResource)` opens the contextual creation workflow. Use `Creator.create()` from creator-api when you want headless execution instead of showing a picker/form.

## Editing selection and reusable controls

`useAppResource()` reads the root resource. The editing stack can point at a different resource, such as a Canvas or Annotation. `ResourceEditingProvider` supplies the reference for a reusable property control; `useResource<T>()` resolves it from the Vault and subscribes to changes:

```tsx
import type { DescriptiveProperties } from "@iiif/presentation-3";
import { ResourceEditingProvider, useResource } from "@manifest-editor/shell";

function ResourceIdentity() {
  const resource = useResource<DescriptiveProperties>();
  return <p>{resource.id}</p>;
}

export function SelectedResource({ id }: { id: string }) {
  return (
    <ResourceEditingProvider resource={{ id, type: "Canvas" }}>
      <ResourceIdentity />
    </ResourceEditingProvider>
  );
}
```

This example also needs a surrounding VaultProvider with the Canvas already loaded. `useResource` throws if nothing is selected. `useOptionalResource()` returns the optional **reference**, not a fully resolved entity. `useEditingResource` and `useEditingResourceStack` expose broader editing-navigation state.

## Preview lifecycle

`usePreviewContext()` exposes `selected`, `active`, `configs`, `handlers`, and `actions`. A configuration selects a viewer; its handler implements creation, updates, focus, and deletion of preview instances.

The actions are `activatePreview(id)`, `selectPreview(id)`, `focusPreview(id)`, `deletePreview(id)`, `updatePreviews()`, and `getPreviewLink()`. Use IDs from the configured previews rather than assuming a viewer is installed. Updating previews serializes or forwards the edited Vault state through the handler; it is not the same as saving the project.

For a live iframe, `createIframeVaultBridge(vault, port)` forwards host Vault state/actions over a MessagePort and returns cleanup. Its preview side is read-only: incoming mutation actions are rejected. `MessagePortClientVault` is re-exported for preview consumers. The host owns iframe creation, port transfer, and teardown.

## Plugins, background work, and specifications

Plugin modules contribute panels, editor/creator definitions, background tasks, settings, and metadata. Register the module namespace through `PluginProvider`; a metadata-only default export is not the complete plugin. `usePlugins`, `useEnabledPlugins`, and `usePluginActions` expose management state; `usePluginSettings` and `usePluginConfigApi` support plugin-specific preferences.

Background actions are app/plugin contributions with their own execution and progress lifecycle. `useAvailableBackgroundActions()` groups the currently available actions; the supplied background action menu and toast components surface them. The specification context exposes configured rules and their reports for interfaces such as the Specifications plugin. These features belong in the shell because they coordinate UI, resource context, and longer-running work.

## Projects are a separate package

The previous shell README also documented project creation, recent projects, loading, storage, and saving. Those APIs now belong to [`@manifest-editor/projects`](../projects), not this package's exports. A multi-project host combines that package's `ProjectProvider` with `MultiAppProvider` and a Vault/storage backend. A single embedded editor does not need a project provider.

## Where to look next

- [Layout contracts](./src/Layout/Layout.types.ts): panel definitions, action overloads, state, and render contexts.
- [App composition](./src/AppContext): mapped apps, app state, and multi-app switching.
- [Plugin contracts](./src/PluginContext/PluginContext.types.ts): modules, metadata, lazy loading, and settings.
- [Configuration](./src/ConfigContext/ConfigContext.tsx): current configuration fields and defaults.
- [Background tasks](./src/BackgroundTasks): action definitions and progress integration.

## API overview

- Composition: `mapApp`, `extendApp`, `AppProvider`, `PluginProvider`, `ShellProvider`, and `Layout`.
- Layout definitions, panels, editing stacks, context menus, and resource hooks.
- Plugin metadata, registration, settings, and enable/disable management.
- Background actions, task progress, specifications, previews, and export controls.
- `Config` and configuration providers for host-managed preferences.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/shell/src) for the complete API and TypeScript definitions.

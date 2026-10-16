<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/projects"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fprojects" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/projects

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Internal project state and backend integration for host applications that manage drafts, loading, and saving. Embedding the basic `ManifestEditor` component does not require this package.

## Quick start

```sh
npm install @manifest-editor/projects
```

```tsx
import { useOptionalCurrentProject } from "@manifest-editor/projects";

export function ProjectStatus() {
  const project = useOptionalCurrentProject();
  return <p>{project ? "Project open" : "No project selected"}</p>;
}
```

Render under the host’s configured `ProjectProvider`. The provider also needs the shell’s multi-app context. It defaults to local-storage backend/loader implementations and accepts custom storage and backend adapters; it does not provide a hosted project service.

## Projects, resources, and storage

A project record wraps a root Manifest/Collection reference with a name, optional filename/thumbnail, storage information, previews, publications, and created/modified timestamps. The record is not the manifest JSON. A backend manages project records; a storage loader supplies the project's Vault and resource data.

`ProjectProvider` combines these pieces and defaults to local-storage implementations. It requires the shell's multi-app context so selecting a project can select the appropriate app. Supply custom `backend` and `storage` props for another host environment; the storage lifecycle includes creating and closing Vault instances.

## Create and navigate projects

Inside the provider tree:

```tsx
import { useProjectCreators } from "@manifest-editor/projects";

export function NewProjectButton() {
  const { createBlankManifest } = useProjectCreators();
  return <button onClick={() => createBlankManifest()}>New manifest project</button>;
}
```

`useProjectCreators()` also exposes `createProjectFromManifestId` and `createProjectFromCollectionId` for importing an external resource. The loading helpers fetch and normalise the supplied IIIF content before creating its project record.

`useProjectContext()` exposes `current`, `allProjects`, nullable `loadingStatus`, `canDelete`, and `actions`. `useCurrentProject()` requires a selection; use `useOptionalCurrentProject()` for launchers and empty states. Check nullable values before reading project fields.

## Project actions

| Actions | Purpose |
| --- | --- |
| `switchProject`, `deselectProject` | Change the active selection. |
| `createProject`, `forkProject`, `deleteProject` | Manage records through the configured backend. |
| `saveProject` | Request a project-record save; resource persistence also depends on the storage loader. |
| `updateDetails`, `updateThumbnail`, `updateSettings`, `updateStorage` | Update record details. |
| `setPreview`, `removePreview` | Associate viewer instances with a project. |
| `createPublication`, `updatePublication`, `removePublication` | Manage publication records; these do not themselves deploy a website or publish to a repository. |
| `load`, `setLoadingStatus` | Internal state integration for host loaders. |

The earlier shell README's project section belongs here. App/panel navigation remains in the shell, while the project backend and storage lifecycle are owned by this package.

## API overview

- `ProjectProvider`, `ProjectReactContext`, and loading context.
- `useProjectContext`, `useCurrentProject`, `useOptionalCurrentProject`, and `useProjectLoading`.
- Backend/action/loading hooks for connecting a host's project storage.
- `AppMenu` and `DraftTitleEditor` UI components.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/projects/src) for the complete API and TypeScript definitions.

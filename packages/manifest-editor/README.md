<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/manifest-editor"><img src="https://img.shields.io/npm/v/manifest-editor" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# manifest-editor

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

An open-source IIIF editing tool for creating, editing, and updating manifests and collections. Embed it in your React application, use the browser runtime from a CDN, or assemble a custom editor from its presets and component APIs.

## Install and use the ESM package

```sh
npm install manifest-editor react@19 react-dom@19
```

Use an ESM-aware bundler with CSS support, such as Vite. Import the component and styles:

```js
import { ManifestEditor } from "manifest-editor";
import "manifest-editor/index.css";
```

`manifest-editor/reset.css` is an optional global reset. Import it **before** `index.css` if your host application needs it. The editor is browser UI: in an SSR framework, mount it in a client component boundary. Server/task code should import the public i18n `/core` entry rather than the React/CSS facade. Native renderer and dependency SSR support must be checked by the host.

### Embed in a React application

```tsx
import { ManifestEditor } from "manifest-editor";
import "manifest-editor/index.css";

export default function App() {
  return (
    <div style={{ height: "100vh" }}>
      <ManifestEditor resource="https://wellcomelibrary.org/iiif/b18035723/manifest" />
    </div>
  );
}
```

The component loads the resource and selects the manifest preset. For a collection, pass an explicit reference:

```tsx
<ManifestEditor resource={{ id: "https://example.org/collection.json", type: "Collection" }} />
```

To manage state and export edited JSON yourself, create a Vault once and pass it in:

```tsx
import { useState } from "react";
import { ManifestEditor } from "manifest-editor";
import { Vault } from "manifest-editor/helpers";
import "manifest-editor/index.css";

const resource = {
  id: "https://wellcomelibrary.org/iiif/b18035723/manifest",
  type: "Manifest" as const,
};

export default function App() {
  const [vault] = useState(() => new Vault());

  function exportManifest() {
    if (!vault.get(resource.id)) return;
    console.log(vault.toPresentation3(resource));
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header><button onClick={exportManifest}>Export JSON to console</button></header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ManifestEditor vault={vault} resource={resource} />
      </div>
    </div>
  );
}
```

Edits live in the Vault. Persist exported JSON through your application's own save mechanism; there is no `onSave` or `onChange` component prop in this release. The optional `data` prop supplies a Manifest or Collection you already have instead of fetching it.

## Interface localisation

`localisation?: ShellLocalisation` forwards public `EditorI18nOptions` unchanged to
ShellProvider. English is the default. Declare `@manifest-editor/i18n` as a direct
host dependency when importing its providers, types or optional catalogs. Register both fallback and selected-locale
metadata; a locale allow-list constrains choices but does not load translations.
The optional public Dutch entry contains the currently reviewed catalogs:

```tsx
import { ManifestEditor, type ShellLocalisation } from "manifest-editor";
import { defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";

// Keep resource option identity stable between renders.
const localisation = {
  locales: [...defaultLocales, dutchLocale],
  catalogs: dutchCatalogs,
  profiles: { plain: dutchPlain },
} satisfies ShellLocalisation;

<ManifestEditor
  resource="https://example.org/manifest"
  localisation={localisation}
  config={{
    uiI18n: { defaultLocale: "nl", availableLocales: ["nl"], defaultProfile: "plain" },
    i18n: { defaultLanguage: "cy", availableLanguages: ["cy"], advancedLanguageMode: true },
  }}
/>;
```

`config.uiI18n` is JSON-compatible UI policy, distinct from authored content
`config.i18n`. Keep catalogs, loaders and callbacks in local runtime/provider
options, outside saved configuration, IIIF exports and worker payloads. Switching
UI locale/profile never changes authored InternationalString values or IDs.
The facade adds no new messages or standalone locale chunks; plain wording falls
back per message and catalog coverage alone does not establish whole-UI coverage.
Exhibition terminology belongs in an explicitly composed exhibition host.

For controlled selection, wrap the editor in the public `EditorI18nProvider`:

```tsx
<EditorI18nProvider
  instance={hostRuntime}
  locale={locale}
  profile={profile}
  onLocaleChange={setLocale}
  onProfileChange={setProfile}
>
  <ManifestEditor resource={resource} localisation={localisation} />
</EditorI18nProvider>
```

Create `hostRuntime` once with `createEditorI18n(localisation)`. Host callbacks
remain authoritative, including rejected requests. Shell intersects host and
preset policy. When an override/preset creates an effective runtime, forward all
host resources, including fallback metadata; an arbitrary inherited instance does
not expose its input catalogs. With no override, Shell retains the original actual
provider instance. Never pass the spread `useEditorI18n()` snapshot as `instance`.
Keep each editor's Vault and React position stable; do not key it by locale/profile.
Selection updates use the current runtime. Replacing resource/configuration options
replaces the effective runtime without remounting editor state and retains allowed
selection. An explicit host runtime replacement uses `instance={newRuntime}`.

Lazy namespaces use `localisation.registrations` (public catalog contracts and
locale-to-loader functions) and `requiredNamespaces`. Loaders must return message
maps and can import host assets or the public `@manifest-editor/i18n/nl` chunk;
there is no private authoring-package import in consumer code. Registration/loading
uses the effective Shell runtime, including plugins and independently mounted
editors. SSR hydration requires matching synchronous resources and selection on
server/client; async-only resources load after mount. The React facade is browser
UI, not a server/task factory. `@manifest-editor/i18n/core` and `/nl` are server-safe
source entries; emitted ESM/CJS/RSC behavior remains a release check.

## Use the CDN browser runtime

The browser runtime is a classic script plus CSS, published under `dist/browser/`. The examples below target **2.2.1** (available once this release is published); use an exact published version with runtime API 2, and keep script and stylesheet versions together.

### Automatically load React

Save this as an HTML file and serve it over HTTP. No bundler or JSX transformation is needed:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Manifest Editor</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/manifest-editor@2.2.1/dist/browser/runtime.css" crossorigin="anonymous">
    <style>
      html, body { margin: 0; height: 100%; }
      body { display: flex; flex-direction: column; }
      header { padding: 12px; border-bottom: 1px solid #ddd; font: 16px system-ui; }
      #editor { flex: 1; min-height: 0; }
    </style>
  </head>
  <body>
    <header>Manifest Editor</header>
    <main id="editor"></main>
    <script src="https://cdn.jsdelivr.net/npm/manifest-editor@2.2.1/dist/browser/runtime.js" crossorigin="anonymous"></script>
    <script type="module">
      const { React, ReactDOMClient, ManifestEditor, Vault } =
        await window.ManifestEditor.automaticRuntime();
      const vault = new Vault();
      const resource = {
        id: "https://wellcomelibrary.org/iiif/b18035723/manifest",
        type: "Manifest",
      };
      await vault.loadManifest(resource.id);
      ReactDOMClient.createRoot(document.getElementById("editor")).render(
        React.createElement(ManifestEditor, { vault, resource })
      );
    </script>
  </body>
</html>
```

`automaticRuntime()` asynchronously imports the runtime's pinned React 19 and public i18n 2.2.1 dependencies from esm.sh, caches the result, and returns the editor exports plus `React`, `ReactDOM`, and `ReactDOMClient`. Use this for a standalone editor page. In an existing React app, inject that app's React environment instead, so there is one React instance.

### Inject an existing React environment

Keep the runtime script and CSS tags above. In your application's bundled client module:

```sh
npm install react@19.2.8 react-dom@19.2.8 react-reconciler@0.33.0 @manifest-editor/i18n@2.2.1
```

```tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as ReactDOMServer from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";
import ReactReconciler from "react-reconciler";
import * as I18n from "@manifest-editor/i18n";
import * as I18nCore from "@manifest-editor/i18n/core";
// Optional types when manifest-editor is installed:
// import type {} from "manifest-editor/remote";

// Run after the runtime.js script has loaded.
const { ManifestEditor, Vault } = window.ManifestEditor.createRuntime({
  I18n,
  I18nCore,
  React,
  ReactDOM,
  ReactDOMClient,
  ReactDOMServer,
  jsxRuntime,
  ReactReconciler,
});

const vault = new Vault();
const resource = {
  id: "https://wellcomelibrary.org/iiif/b18035723/manifest",
  type: "Manifest" as const,
};
await vault.loadManifest(resource.id);

ReactDOMClient.createRoot(document.getElementById("editor")!).render(
  <ManifestEditor vault={vault} resource={resource} />
);
```

All eight dependencies are required by `createRuntime()` in runtime API 2 (including `I18n` and `I18nCore`). API 1 scripts are incompatible with this loader; regenerate release descriptors for API 2. `ReactDOMServer` is used in the browser to serialize rich-text content; it does not mean a Node server is required. `ReactReconciler` supports the Atlas canvas renderer. Keep the reconciler compatible with the React version you supply. If using TypeScript, the `manifest-editor/remote` entry point declares the browser runtime types (including `window.ManifestEditor`); it can be included with `import type {} from "manifest-editor/remote"` when the package is installed.

### Browser/remote localisation and updates

The browser build externalizes `@manifest-editor/i18n` and `/core`, exactly like
React. Inject the same public modules used by your host/plugins; returned `i18n`
and `i18nCore` namespaces preserve their identities. `automaticRuntime()` imports
the pinned public modules from esm.sh; use the returned `i18n` for its provider and
hooks rather than loading another context. The pinned public i18n release must be
published before this automatic path can work; no CDN availability is claimed here.
Fetch optional Dutch resources from the matching public `/nl` entry, then pass
locale metadata/catalogs/profiles as in the React example above.

There is no separate mount/update transport API. Retain one React root, Vault,
resource reference and captured runtime, and call `root.render` with the same
`ManifestEditor` component type and updated `localisation`/`config` props. For
interactive selection use the runtime's shared provider/hooks. Do not recreate a
factory/root or serialize runtime objects/functions to a worker or saved config.
The remote loader accepts the same module identities under the explicit
`RuntimeHost` keys `"@manifest-editor/i18n"` and `"@manifest-editor/i18n/core"`.
Reuse the host object to reuse its cached factory result; distinct host environments
are isolated even when React happens to be the same module. Release script/CSS
loading does not carry or persist editor/localisation state.

Publication gate: source tests verify delegation and module identity with synthetic
asset completion. ESM/CJS tarballs, browser bundles, CDN availability, actual SRI,
SSR dependencies and independently installed plugins still require module29's
built-artifact checks. No build/prepack was run for this source migration.

### Integrity and version selection

The minimal HTML above pins versions but omits integrity hashes. For deployment, obtain the matching `dist/browser/release.json` from your trusted release process and copy its `script.integrity` and `stylesheet.integrity` values onto the corresponding tags as `integrity="sha384-…"`. Retain `crossorigin="anonymous"`. Do not reuse a hash from a different build. These hashes cover the editor script and CSS; they do not cover the esm.sh modules fetched by `automaticRuntime()`.

For application-managed version selection, `manifest-editor/remote` exports `resolveRelease`, `validateCatalog`, and `loadManifestEditor`. Selections can be an exact version, a minor line such as `2.2.x` (the highest catalogued stable patch), or `latest` (the catalog’s designated stable release). Prereleases require an exact version. Resolve a release from your trusted catalog, then pass that descriptor and the host dependencies to the loader. It verifies script/CSS integrity, checks runtime compatibility, and returns `{ runtime, release, dispose }`. `dispose()` removes the loaded stylesheet; the host must unmount its React root separately. See the [remote API source](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor/src/remote) for catalog and host types.

## Presets, plugins, and configuration

`ManifestEditor` selects the manifest or collection preset from `resource.type`. Use `config` for editor preferences and `saveConfig` to persist them. Register additional plugin **modules**, not just their default metadata exports:

```tsx
import * as translation from "@manifest-editor/translation";

<ManifestEditor
  resource="https://wellcomelibrary.org/iiif/b18035723/manifest"
  plugins={[translation]}
  enabledPlugins={["@manifest-editor/translation"]}
/>
```

Install the plugin separately. Plugin-specific service/runtime settings may also be required. The manifest preset already includes annotations and the canvas-label generator; enable or disable those by ID without registering duplicates.

For custom layouts or the exhibition preset, compose the providers from `manifest-editor/shell`. There is no `preset` prop on the combined component. See the [shell guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/shell#quick-start).

## API overview

### Component props

| Prop | Purpose |
| --- | --- |
| `resource` | Required manifest URL or `{ id, type: "Manifest" \| "Collection" }`. |
| `data` | Optional source JSON to load instead of fetching. |
| `vault` | Host-owned Vault; otherwise the component uses an existing context or its fallback Vault. |
| `localisation` | Public Shell UI resources, locale metadata, loaders and runtime options; separate from persisted config. |
| `config`, `saveConfig` | Editor preferences and their persistence callback. |
| `plugins` | Additional plugin modules or mapped/lazy plugin inputs. |
| `enabledPlugins`, `disabledPlugins` | Plugin IDs to enable or disable. |
| `globalPluginConfig`, `saveGlobalPluginConfig` | Shared plugin settings and persistence callback. |
| `layoutMode` | `"default"` or `"focused"`. |

### Package entry points

| Import | Exports |
| --- | --- |
| `manifest-editor` | `ManifestEditor`, its props, and selected config/plugin types. |
| `manifest-editor/shell` | Providers, layouts, plugin APIs, and host configuration. |
| `manifest-editor/components` | Reusable UI components and icons. |
| `manifest-editor/editor-api`, `manifest-editor/creator-api` | Editing and resource-creation APIs. |
| `manifest-editor/editors`, `manifest-editor/creators` | Built-in editor and creator definitions. |
| `manifest-editor/manifest-preset` | Manifest preset module; use `mapApp` for shell composition. |
| `manifest-editor/collection-preset`, `manifest-editor/exhibition-preset` | Mapped collection/exhibition app definitions. |
| `manifest-editor/vault` | `react-iiif-vault` providers and hooks. |
| `manifest-editor/helpers` | `@iiif/helpers`, including `Vault`. |
| `manifest-editor/parser` | `@iiif/parser` exports. |
| `manifest-editor/remote` | Release catalog, resolver, integrity loader, and browser runtime types. |
| `manifest-editor/index.css`, `manifest-editor/reset.css` | Editor stylesheet and optional global reset. |

The CDN runtime returns `ManifestEditor`, `Vault`, `runtimeApiVersion`, `i18n`, `i18nCore`, and namespaces named `shell`, `components`, `creators`, `creatorApi`, `editorApi`, `manifestPreset`, `collectionPreset`, `exhibitionPreset`, and `vault`. Its namespace layout differs from npm subpath imports.

![Manifest Editor screenshot](https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/manifest-editor.png)

## What is the Digirati IIIF Manifest Editor?

The Manifest Editor is an open-source web based editor, built from the ground up using IIIF, JS and HTML. At its core it allows users to view IIIF manifests in an intuitive way, without the need to understand JSON, supporting learning and exploration of IIIF Manifests and how these are assembled by institutes and organisations to deliver rich, engaging online viewing experiences.

You can use it to create new IIIF manifests, adding metadata, creating and managing canvases for simple and complex IIIF manifest requirements. You can preview your work in progress in a range of configured IIIF viewers, whilst you can share your work in progress or completed manifests with other users using the sharing options.

You can enhance manifests using the editor to add and edit annotations, create IIIF ranges (Table of Contents), change manifest behaviours and add geographic coordinates data (via navPlace) to support enriching your manifest with map-based interfaces.

You can also create IIIF Collections, adding metadata and selecting and adding existing IIIF Manifests to your collection.

The Manifest Editor provides an exhibition building workbench, enabling users to curate their IIIF Manifests for display as an exhibition or learning resource using the Exhibition Viewer.

## Standard Features

- Simple, intuitive user interface supporting comprehensive IIIF Manifest and IIIF Collection creation and editing
- Ability to browse and search existing IIIF content to select and edit items, or select or edit IIIF content directly from disk or via specific URL
- Support for curating complex, mixed content canvases enabling the assembly of multi-image or image and A/V content as needed
- Comprehensive support for creating and managing simple or complex IIIF ranges (table of contents)
- Ability to annotate IIIF resources
- Exhibition editing tools to support curating and enhancing IIIF content for story telling or exhibition display
- Extensible application enabling further customisation and configuration specific to institute or organisational use cases and workflows

## Audience

The Manifest Editor has been developed to support users creating and editing IIIF content; with a focus on usability to enable those wishing to learn or already familiar with the IIIF standard.

There are a whole range of use cases for visually editing IIIF Manifests; from within the context of museums, libraries, archives and their workflows to research and education.

The Manifest Editor can be used as is, or it can be further configured and customised to support specific requirements including integrating it into your workflows in ways that fit your organisational processes.

## Background

In 2017 we started working on [IIIF Manifest-driven narratives](https://medium.com/digirati-ch/reaching-into-collections-to-tell-stories-3dc32a1772af) for the V&A, and in 2018 for [Delft University of Technology Library](https://drive.google.com/file/d/1ZRXJaOYNbOD0jsOF79maKhxl5re4-2Kt/view). These were based on the first iteration of our [Canvas Panel](https://iiif-canvas-panel.netlify.app/) component.

In 2018 we developed an experimental [IIIF Workbench](https://www.youtube.com/watch?v=HHQdQ8Ti5eI&t=12s) for assembling complex canvases in a visual environment (like PowerPoint).

These combined to make a [IIIF Manifest Editor](https://www.youtube.com/watch?v=D8oA3rHbvPM) that in normal, default mode produces IIIF Presentation 3 Manifests, but can be extended with plugins to produce IIIF Manifests with particular structures and custom `behavior` properties, to drive custom viewing experiences - slideshows, guided viewing and the complex digital exhibition layouts seen in the Delft examples. Development of branches of the Manifest Editor for different clients went hand in hand with new viewers and static site generators.

## Join the discussion

If you have a question or want to explore ideas with how the Manifest Editor can be extended or improved, you can contact us at Digirati (contact@digirati.com) or use GitHub discussions.

## Acknowledgements

The development of the IIIF Manifest Editor has been supported by:

- [Canadian Research Knowledge Network](https://www.crkn-rcdr.ca/en)
- [Delft University of Technology Library](https://www.tudelft.nl/library)
- [The National Gallery](https://www.nationalgallery.org.uk/), [Practical applications of IIIF](https://tanc-ahrc.github.io/IIIF-TNC/) project funded by [AHRC](https://ahrc.ukri.org/) as a [Foundation Project](https://www.nationalcollection.org.uk/Foundation-Projects) within the [Towards a National Collection](https://www.nationalcollection.org.uk/) programme. [Dec 2021 - Apr 2022]
- [Canadian Research Knowledge Network](https://www.crkn-rcdr.ca/en)

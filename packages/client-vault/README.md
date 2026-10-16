<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/client-vault"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fclient-vault" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/client-vault

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Client-side Vault adapters for synchronising IIIF state over WebSockets or a MessagePort. Intended for host integrations and live previews.

## Quick start

```sh
npm install @manifest-editor/client-vault
```

```ts
import { createClientVault } from "@manifest-editor/client-vault";

const vault = await createClientVault("ws://localhost:8081/vault/demo");
console.log(vault.getState());
```

Start a compatible server first (see `@manifest-editor/server-vault`). A MessagePort connection requires a host bridge; it is not a WebSocket URL.

## API overview

- `createClientVault(url, options?)`: connects and waits for initial state.
- `ClientVault`: WebSocket-backed Vault implementation.
- `MessagePortClientVault`: MessagePort-backed implementation for embedded previews.
- Protocol types for messages and remote Vault actions.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/client-vault/src) for the complete API and TypeScript definitions.

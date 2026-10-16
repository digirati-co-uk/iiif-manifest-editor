<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/iiif-preview-server"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fiiif-preview-server" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/iiif-preview-server

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Framework-neutral HTTP handlers for temporarily storing and sharing IIIF manifests and collections. Bring your own router and storage adapter.

## Quick start

```sh
npm install @manifest-editor/iiif-preview-server
```

```ts
import { createMemoryStore, storeRoute, type RouteConfig } from "@manifest-editor/iiif-preview-server";

const config: RouteConfig = {
  storage: createMemoryStore(),
  baseUrl: "http://localhost:8082/",
  keyLength: 32,
  partLength: 16,
  updateKeyLength: 16,
  expirationTtl: 48 * 60 * 60,
  encryptedEnabled: true,
  rotatingUpdateKey: false,
  accessControlAllowPrivateNetwork: false,
};

// Attach this handler to POST /store in your HTTP framework.
export function store(request: Request) {
  return storeRoute(request, {}, config);
}
```

Wire the retrieval, update, and deletion routes too before using the returned URLs. Route configuration expresses `expirationTtl` in seconds. Use durable storage for a deployed service; the memory adapter loses data when the process exits.

## API overview

- `storeRoute`, `retrieveRoute`, `updateRoute`, `deleteRoute`: Web Request/Response handlers.
- `createMemoryStore`: ephemeral storage for local use.
- `StorageInterface`, `StoredResource`, `Config`, `RouteConfig`: host contracts.
- Helpers for encryption, IDs, URL parsing, and response headers.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/iiif-preview-server/src) for the complete API and TypeScript definitions.

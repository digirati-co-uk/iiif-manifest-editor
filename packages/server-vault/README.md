<p align="center">
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor"><img src="https://raw.githubusercontent.com/digirati-co-uk/iiif-manifest-editor/main/apps/docs/content/img/logo.svg" width="360" alt="Manifest Editor"></a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@manifest-editor/server-vault"><img src="https://img.shields.io/npm/v/%40manifest-editor%2Fserver-vault" alt="npm version"></a>
  <a href="https://github.com/digirati-co-uk/iiif-manifest-editor/actions/workflows/build-test.yml"><img src="https://img.shields.io/github/actions/workflow/status/digirati-co-uk/iiif-manifest-editor/build-test.yml?branch=main&amp;label=build" alt="Build status"></a>
  <a href="https://manifest-editor-docs.netlify.app/"><img src="https://img.shields.io/badge/docs-Manifest_Editor-blue" alt="Documentation"></a>
</p>

# @manifest-editor/server-vault

## Getting started with Manifest Editor

For the complete editor, start with [`manifest-editor`](https://www.npmjs.com/package/manifest-editor) and its [installation and integration guide](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/manifest-editor#readme). It combines the editor UI, presets, creators, and editing APIs. This package is one part of that workspace.

## About

Experimental Node.js WebSocket service for sharing in-memory Vault state between clients.

## Quick start

```sh
npm install @manifest-editor/server-vault
```

```ts
import { MultiVaultServer } from "@manifest-editor/server-vault";

const server = new MultiVaultServer();
server.listen(8081, "127.0.0.1");
// Clients connect to ws://localhost:8081/vault/demo.
```

This implementation keeps state in memory and does not implement the authentication, durable storage, or GitHub integration described in earlier design notes. Keep this example local; a deployed host must supply its own access controls and persistence.

## Architecture and lifecycle

A `MultiVaultServer` owns an HTTP server and a map of named `ServerVault` instances. Each `ServerVault` contains a normal `@iiif/helpers` Vault plus a WebSocket server. The browser uses [`@manifest-editor/client-vault`](../client-vault) to receive the initial state and exchange Vault actions.

1. A client connects to `/vault/<id>`.
2. The server looks up that ID and creates an empty in-memory Vault if necessary.
3. The server sends an `init-response` containing its current IIIF store.
4. Clients send atomic Vault actions; the server applies them and broadcasts them to other clients.
5. The originating client receives an acknowledgement, or a rejection if applying the action throws.

`GET /vault` returns the IDs currently in the server's map. There is no project database or user-specific project listing behind that route.

## Start with an existing manifest

For a local demonstration, seed the server's Vault before clients connect:

```ts
import { MultiVaultServer, ServerVault } from "@manifest-editor/server-vault";

const server = new MultiVaultServer();
const shared = new ServerVault();
await shared.vault.loadManifest("https://wellcomelibrary.org/iiif/b18035723/manifest");
server.vaults.set("demo", shared);
server.listen(8081, "127.0.0.1");
```

In a separate browser application:

```ts
import { createClientVault } from "@manifest-editor/client-vault";

const vault = await createClientVault("ws://localhost:8081/vault/demo");
// Pass this Vault to ManifestEditor or a VaultProvider.
```

The client factory waits for initial state. It does not load a manifest from disk or create a project record on the server. The underlying `shared.vault` is available for server-side loading and serialization, but the server's broadcasts are driven by incoming client messages; do not assume arbitrary server-side Vault mutations are automatically broadcast.

## Wire protocol

Messages are JSON. Action messages carry `_id`, `_type`, `_lastActionId`, and `action`; initialisation messages carry the complete IIIF store in `data`.

| Message | Direction | Behavior |
| --- | --- | --- |
| `init-request` | Client → server | Request current state. |
| `init-response` | Server → client | Send the normalised store and action position. |
| `vault-action` | Client → server → other clients | Apply and distribute a Vault action or batch. |
| `vault-action-confirmation` | Server → originating client | Acknowledge the action. |
| `vault-action-rejection` | Server → originating client | Report an action the server could not apply. |

The older design proposed rejecting actions whose `_lastActionId` does not match the server's current position. The implementation carries that field but **does not enforce this conflict check**. It is not a conflict-resolution protocol or a CRDT. Likewise, the exported `initialise-with-resource`/`empty-vault-response` types should not be read as proof of a complete server-side initialisation flow: the handler currently processes `init-request` and `vault-action`.

## Connections and cleanup

`ServerVaultOptions.pingTimeout` controls the heartbeat interval in milliseconds (default 30,000). Unresponsive clients are terminated. `onClose` runs when the WebSocket server closes, and `await shared.close()` closes that server and clears its timer. Close connected clients and the HTTP server as part of host shutdown too.

Do not rely on the last client disconnecting to persist or automatically dispose of a named Vault. A host should explicitly decide retention, cleanup, and storage policy.

## Iframes and MessagePort previews

The older README described a server-hosted iframe proxying messages between a parent page and WebSockets. That complete transport/proxy service is not implemented here.

There is now a separate browser-side preview path: the shell exports `createIframeVaultBridge(vault, port)`, and client-vault exports `MessagePortClientVault`. The shell bridge sends initial state and host updates but rejects actions from the preview, making it a read-only preview bridge. It returns a cleanup function. The embedding host still has to create/transfer the MessagePort and establish the iframe relationship.

## Persistence and hosted collaboration: design notes

The original direction remains useful for hosts extending this package, but these features are **not provided by the current server**:

- A `.vaultfile` mapping a source manifest to files, periodic snapshots, and loading/saving to disk.
- Authentication, allowed-origin checks, project ownership, and distinct read-only/read-write permissions.
- Durable action history, reconnect/replay, and rejection/reconciliation of stale edits.
- GitHub login, repository-backed manifests, editing branches, commits, and pull requests.
- A user-scoped project API and authenticated iframe bootstrap.

One proposed file mapping looked like this (a design example, **not** a configuration file this package reads):

```json
{
  "source": { "id": "https://example.org/manifest", "type": "Manifest" },
  "resources": { "https://example.org/manifest": "./manifest.json" }
}
```

For durable storage, a host could serialize `shared.vault.toPresentation3(reference)` and restore it on startup. For GitHub-backed work, that serialization would become the input to the host's commit/PR workflow. These are integration responsibilities, not automatic behavior of `MultiVaultServer`.

The current implementation accepts Vault actions from connected clients without authentication. Bind a development instance to loopback, as shown above; deploying a collaborative service requires implementing the access and validation boundaries described here.

## API overview

- `MultiVaultServer`: HTTP server, `/vault` listing, and WebSocket upgrades under `/vault/<id>`.
- `ServerVault`: one shared Vault, action broadcasting, connection heartbeat, and `close()`.
- `ServerVaultOptions`, `ClientAction`, and `ServerAction`: configuration and message types.

See the [source exports](https://github.com/digirati-co-uk/iiif-manifest-editor/tree/main/packages/server-vault/src) for the complete API and TypeScript definitions.

# Server vault language boundary

Status: Complete — language-neutral boundary review; no runtime changes required. Module: [`packages/server-vault`](../../../../packages/server-vault).

Reviewed against foundation `288a0405b96989f88a42055f9ef00fb9ac0683f5`. No locale runtime, catalogs, semantic message IDs, namespaces or translator placeholders are required. UI locale and wording profile are host presentation concerns; authored IIIF content languages remain data.

## Reviewed source and public boundary

All three source files were read, together with `package.json` exports, `tsconfig.json`, `tsdown.config.ts` and the package README:

- `src/index.ts` re-exports the server classes, options and action types. There is no UI entry point or language dependency.
- `src/server.ts` owns the HTTP listing, in-memory named-vault map and WebSocket upgrades.
- `src/server-vault.ts` owns Vault state, action dispatch, JSON envelopes, broadcasts and connection lifecycle.

The [source inventory](../inventories/25-server-vault.md) has no candidates. Manual review confirms the following exemptions, including strings the heuristic does not collect:

| Surface                                                                                                | Classification and decision                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/vault` response `{ vaults: [...] }`                                                                  | JSON API containing opaque map keys; no presentation labels. Return keys unchanged.                                                                                                                                                                                       |
| HTTP request fallback                                                                                  | Status 404 with no authored body. Any default HTTP reason phrase belongs to the HTTP implementation.                                                                                                                                                                      |
| Rejected upgrade `HTTP/1.1 404 Not Found\r\n\r\n`                                                      | HTTP status line, not an application error message. Preserve the wire representation.                                                                                                                                                                                     |
| `ws.url`, `new vault`, `new client`, `destroying vault`                                                | Server console diagnostics, with URL or vault ID context. No repository UI consumes these logs. Keep outside catalogs.                                                                                                                                                    |
| `init-request`, `init-response`, `vault-action`, `vault-action-confirmation`, `vault-action-rejection` | Stable protocol discriminants, not readable notifications. Rejection carries the originating action ID, without an English error payload. No additional code/context contract is needed.                                                                                  |
| `initialise-with-resource`, `empty-vault-response`                                                     | Exported protocol types; the server handler does not implement these flows. Preserve the types without claiming runtime support.                                                                                                                                          |
| `@genesis`, `_id`, `_type`, `_lastActionId`, `action`, `data`, `resource`                              | Action positions, envelope keys and resource payloads. Preserve unchanged.                                                                                                                                                                                                |
| `error` listener, dispatch catch and `close()` rejection                                               | Listener/catch contain no authored error message; dispatch failure sends the rejection envelope. `close()` forwards the underlying WebSocket error to the host. No error text is rendered here. JSON parsing errors likewise have no presentation mapping in this module. |
| IIIF store, resource IDs, language-map keys and values                                                 | Authored content and protocol data; never resolve through UI messages or format by locale.                                                                                                                                                                                |

There is no durable storage, browser storage key, locale negotiation, worker implementation, undo manager or React surface in this package. Named vaults live in `MultiVaultServer.vaults`; their existing URL-derived keys remain opaque, including any query text. This review does not change URL parsing or transport behaviour.

## Callers and presentation ownership

Reviewed `packages/client-vault/src/index.ts`, `client-vault.ts`, `remote-client-vault.ts`, `protocol.ts` and `message-port-client-vault.ts`. The WebSocket client receives the initial IIIF store, dispatches actions and treats rejection as a resynchronisation signal. It does not render rejection text. Protocol names also serve the MessagePort client and must remain stable.

`packages/projects/src/storage/WebsocketLoader.ts` is the repository's WebSocket consumer: it constructs a URL from the project storage ID/token and returns the client Vault/readiness promise. There is no direct runtime import of server-vault elsewhere in the repository; hosts instantiate the exported server as documented in its README.

Also reviewed the shell's `PreviewVault/vault-message-bridge.ts`, its existing regression test, and the web host's `components/iframe-preview/IframePreviewRoute.tsx`. The preview bridge is a separate MessagePort transport, not a server-vault caller. Its rejection discriminant is shared protocol; the preview route's loading/empty/unsupported-resource wording belongs to the web host.

Explicit UI-owner follow-up, outside this module:

- Client-vault/projects owners must classify their own authored exceptions (for example `Vault not yet ready` and unsupported storage operations). If a host displays connection, readiness or action-failure feedback, that host owns the translated message and request/editor locale policy. Do not display a translated transport discriminant or require a process-global locale here.
- The web-host owner must migrate the iframe preview route's visible connection/loading/empty/unsupported-resource messages. These are not server responses.

No current server-owned user-facing response requires migration. These follow-ups do not block this module's boundary review.

## Acceptance checks and validation

- [x] Concurrent requests with different UI locales cannot affect each other's stored or returned IIIF data: no locale/profile input, global locale or language lookup exists. An in-memory smoke check interleaved HTTP listing requests with `Accept-Language: fr` and `cy` and verified identical opaque vault IDs. Two connected socket doubles received the same authored `cy`/`fr`/`none` maps before and after a Vault action and state resynchronisation.
- [x] Existing server-vault checks remain valid without locale initialization: the package has no dedicated test script or server-vault test files. Its configured no-emit typecheck passes; source lint passes. No i18n initialization or dependency was added.
- [x] User-visible errors, if any, have an explicit boundary owner: there is no authored server response prose; diagnostics and HTTP status syntax stay neutral. Client/host presentation responsibilities are recorded above.

Checks performed on 28 October 2026, without package builds or a listening test server:

| Check                                                                              | Actual result                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit -p packages/server-vault/tsconfig.json` (installed TypeScript 7.0.2) | Passed with the existing workspace configuration, including `tsdown.config.ts`.                                                                                                                                                                       |
| `oxlint packages/server-vault/src --deny-warnings`                                 | Passed.                                                                                                                                                                                                                                               |
| `node scripts/audit-i18n.mjs --scope packages/server-vault`                        | Passed: 3 files, 0 candidates, 0 parse errors; no inventory output written.                                                                                                                                                                           |
| Temporary in-memory source smoke check, executed through installed Jiti            | Passed: multilingual initial state and Presentation 3 export, interleaved language headers, opaque map keys, action ID/position, identical forwarded Buffer object/bytes, confirmation and subsequent state responses. No sockets listened on a port. |

The smoke check exercised existing public behaviour and was kept outside the repository; no implementation-mirroring test suite was added for this documentation-only result. It does not claim browser locale-switch, worker or undo integration coverage. Those remain the owning UI/runtime modules' acceptance work; this package's source and transport are unchanged.

Dependencies were reused from the existing primary checkout through temporary ignored `node_modules` links, without installation or lifecycle scripts. An initial typecheck before linking the workspace root failed to resolve `@repo/typescript-config`; after restoring normal workspace dependency resolution, the unmodified package typecheck passed. No generated files, manifests or lockfiles were changed.

## Handoff

Completed all server-vault source, export, response and caller review. All inventory entries are exempt (zero candidates); no translation catalogs or locale/profile availability claims apply to this non-UI module. Runtime prerequisites: none. Pending server-vault implementation: none. Preserve stable IDs, content-language maps, in-memory keys, action order and transport bytes in future UI localisation work.

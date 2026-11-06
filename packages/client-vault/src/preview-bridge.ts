import type { Vault, VaultCommit } from "@iiif/helpers/vault";
import { parseVaultMessage, stringifyVaultMessage } from "./wire";

type Target = { port: MessagePort; initialized: boolean; protocol: 1 | 2 };
type Registry = { targets: Set<Target>; stop: () => void; lastId: string };
const registries = new WeakMap<object, Registry>();

/** Read-only committed document replication. Never intercept dispatch or echo port edits. */
export function createReadOnlyVaultBridge(vault: Vault, port: MessagePort) {
  const key = vault.getStore();
  let registry = registries.get(key);
  if (!registry) {
    const entry: Registry = { targets: new Set(), stop: () => {}, lastId: "@genesis" };
    const stopCommits = vault.subscribeCommits((commit: VaultCommit) => {
      const previous = entry.lastId;
      entry.lastId = commit.id;
      const message = {
        _type: "vault-action",
        _id: commit.id,
        _lastActionId: previous,
        action: {
          type: "@iiif/BATCH" as const,
          payload: { actions: commit.actions.map(({ type, payload }) => ({ type, payload })) },
        },
        options: commit.options,
      };
      for (const target of entry.targets) {
        if (!target.initialized) continue;
        // Older helpers cannot apply the new history action. Resync their document instead.
        if (target.protocol === 1 && commit.actions.some((action) => action.type === "@iiif/APPLY_HISTORY")) {
          sendInitialState(target, vault, entry.lastId);
        } else {
          send(target, message);
        }
      }
    });
    const stopReset = key.onReset((phase) => {
      if (phase !== "after") return;
      entry.lastId = "@genesis";
      for (const target of entry.targets) if (target.initialized) sendInitialState(target, vault, entry.lastId);
    });
    entry.stop = () => {
      stopCommits();
      stopReset();
    };
    registry = entry;
    registries.set(key, registry);
  }
  const current = registry;
  const target: Target = { port, initialized: false, protocol: 1 };
  const listener = (event: MessageEvent) => {
    let message: any;
    try {
      message = parseVaultMessage(event.data);
    } catch {
      return;
    }
    if (message?._type === "init-request") {
      // A legacy viewer sends a plain init-request without a protocol version.
      target.protocol = message.protocol === 2 ? 2 : 1;
      target.initialized = true;
      sendInitialState(target, vault, current.lastId);
    } else if (message?._id) {
      send(target, {
        _type: "vault-action-rejection",
        _id: message._id,
        action: message._id,
        reason: "read-only",
      });
    }
  };
  current.targets.add(target);
  port.addEventListener("message", listener);
  port.start();
  return () => {
    port.removeEventListener("message", listener);
    current.targets.delete(target);
    if (!current.targets.size) {
      current.stop();
      registries.delete(key);
    }
    port.close();
  };
}

function send(target: Target, message: unknown) {
  target.port.postMessage(target.protocol === 2 ? stringifyVaultMessage(message) : JSON.stringify(message));
}

function sendInitialState(target: Target, vault: Vault, lastId: string) {
  send(target, {
    _type: "init-response",
    _lastActionId: lastId,
    data: { iiif: vault.getState().iiif },
    readOnly: true,
  });
}

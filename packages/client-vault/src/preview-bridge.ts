import type { Vault, VaultCommit } from "@iiif/helpers/vault";
import { parseVaultMessage, stringifyVaultMessage } from "./wire";

type Target = { port: MessagePort; initialized: boolean };
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
      const message = stringifyVaultMessage({
        _type: "vault-action",
        _id: commit.id,
        _lastActionId: previous,
        action: {
          type: "@iiif/BATCH" as const,
          payload: { actions: commit.actions.map(({ type, payload }) => ({ type, payload })) },
        },
        options: commit.options,
      });
      for (const target of entry.targets) if (target.initialized) target.port.postMessage(message);
    });
    const stopReset = key.onReset((phase) => {
      if (phase !== "after") return;
      entry.lastId = "@genesis";
      for (const target of entry.targets)
        if (target.initialized)
          target.port.postMessage(
            stringifyVaultMessage({
              _type: "init-response",
              _lastActionId: entry.lastId,
              data: { iiif: vault.getState().iiif },
              readOnly: true,
            })
          );
    });
    entry.stop = () => {
      stopCommits();
      stopReset();
    };
    registry = entry;
    registries.set(key, registry);
  }
  const current = registry;
  const target: Target = { port, initialized: false };
  const listener = (event: MessageEvent) => {
    let message: any;
    try {
      message = parseVaultMessage(event.data);
    } catch {
      return;
    }
    if (message?._type === "init-request") {
      target.initialized = true;
      port.postMessage(
        stringifyVaultMessage({
          _type: "init-response",
          _lastActionId: current.lastId,
          data: { iiif: vault.getState().iiif },
          readOnly: true,
        })
      );
    } else if (message?._id) {
      port.postMessage(
        stringifyVaultMessage({
          _type: "vault-action-rejection",
          _id: message._id,
          action: message._id,
          reason: "read-only",
        })
      );
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

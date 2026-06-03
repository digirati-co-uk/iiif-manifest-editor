import type { AllActions, Vault } from "@iiif/helpers/vault";
import type { BatchAction } from "@iiif/helpers/vault/actions";
import type {
  RemoteVaultAction,
  RemoteVaultClientMessage,
} from "@manifest-editor/shell";

function randomId() {
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

type BridgeTarget = {
  port: MessagePort;
  lastActionId: string;
};

type VaultBridgeRegistry = {
  originalDispatch: Vault["dispatch"];
  patchedDispatch: Vault["dispatch"];
  targets: Set<BridgeTarget>;
};

const registries = new WeakMap<Vault, VaultBridgeRegistry>();

export function createIframeVaultBridge(vault: Vault, port: MessagePort) {
  const target: BridgeTarget = {
    port,
    lastActionId: "@genesis",
  };
  const registry = getVaultBridgeRegistry(vault);

  function send(message: unknown) {
    port.postMessage(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }

  function sendInitResponse() {
    send({
      _id: randomId(),
      _type: "init-response",
      _lastActionId: target.lastActionId,
      data: vault.getState(),
    });
  }

  function sendRejection(actionId: string) {
    send({
      _id: actionId,
      _type: "vault-action-rejection",
      _lastActionId: target.lastActionId,
      action: actionId,
    });
  }

  function handleMessage(event: MessageEvent) {
    const parsed = parseMessage(event.data);
    if (!parsed) return;

    if (parsed._type === "init-request") {
      sendInitResponse();
      return;
    }

    if (parsed._type === "vault-action") {
      sendRejection(parsed._id);
    }
  }

  registry.targets.add(target);
  port.addEventListener("message", handleMessage);
  port.start();

  return () => {
    port.removeEventListener("message", handleMessage);
    registry.targets.delete(target);
    if (registry.targets.size === 0 && vault.dispatch === registry.patchedDispatch) {
      vault.dispatch = registry.originalDispatch;
      registries.delete(vault);
    }
    port.close();
  };
}

function getVaultBridgeRegistry(vault: Vault): VaultBridgeRegistry {
  const existing = registries.get(vault);
  if (existing) {
    return existing;
  }

  const originalDispatch = vault.dispatch.bind(vault) as Vault["dispatch"];
  const targets = new Set<BridgeTarget>();
  const patchedDispatch = ((action: AllActions | BatchAction) => {
    const result = originalDispatch(action);
    for (const target of targets) {
      mirrorAction(target, action);
    }
    return result;
  }) as typeof vault.dispatch;
  const registry = { originalDispatch, patchedDispatch, targets };

  vault.dispatch = patchedDispatch;
  registries.set(vault, registry);

  return registry;
}

function mirrorAction(target: BridgeTarget, action: AllActions | BatchAction) {
  const wrapped: RemoteVaultAction = {
    _id: randomId(),
    _type: "vault-action",
    _lastActionId: target.lastActionId,
    action,
  };
  target.lastActionId = wrapped._id;
  target.port.postMessage(JSON.stringify(wrapped));
}

function parseMessage(data: unknown): RemoteVaultClientMessage | null {
  try {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    if (typeof data === "object" && data) {
      return data as RemoteVaultClientMessage;
    }
  } catch {
    return null;
  }

  return null;
}

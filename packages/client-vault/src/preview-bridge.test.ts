import { Vault } from "@iiif/helpers/vault";
import { describe, expect, test, vi } from "vitest";
import { MessagePortClientVault } from "./message-port-client-vault";
import { createReadOnlyVaultBridge } from "./preview-bridge";
import { parseVaultMessage, stringifyVaultMessage } from "./wire";

class TestPort {
  messages: string[] = [];
  listener?: (event: MessageEvent) => void;
  addEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listener = listener;
  }
  removeEventListener() {
    this.listener = undefined;
  }
  postMessage(message: string) {
    this.messages.push(message);
  }
  start() {}
  close() {}
  receive(message: unknown) {
    this.listener?.({ data: message } as MessageEvent);
  }
}

const canvas = { id: "c", type: "Canvas" as const };
function sourceVault() {
  const vault = new Vault({ history: true });
  vault.loadSync(canvas.id, { ...canvas, width: 100, height: 100 });
  return vault;
}

// Deliberately use only JSON.parse and old action types, like the deployed viewer.
function flushLegacy(port: TestPort, receiving: Vault) {
  return port.messages.splice(0).map((wire) => {
    const message = JSON.parse(wire);
    expect(message._type).toBeDefined();
    expect(message._vaultWire).toBeUndefined();
    if (message._type === "init-response") receiving.getStore().setState(message.data);
    if (message._type === "vault-action") {
      expect(message.action.payload.actions.some((action: any) => action.type === "@iiif/APPLY_HISTORY")).toBe(false);
      receiving.dispatch(message.action);
    }
    return message;
  });
}

describe("preview bridge compatibility", () => {
  test.each([false, true])(
    "legacy viewers initialise, edit, undo, redo and reset (string request: %s)",
    (stringRequest) => {
      const source = sourceVault(),
        receiving = new Vault(),
        port = new TestPort();
      const close = createReadOnlyVaultBridge(source, port as unknown as MessagePort);
      try {
        const request = { _type: "init-request" };
        port.receive(stringRequest ? JSON.stringify(request) : request);
        expect(flushLegacy(port, receiving)[0]._type).toBe("init-response");
        expect(receiving.get(canvas).width).toBe(100);
        source.modifyEntityField(canvas, "width", 300);
        expect(flushLegacy(port, receiving)[0]._type).toBe("vault-action");
        expect(receiving.get(canvas).width).toBe(300);
        expect(source.undo().ok).toBe(true);
        expect(flushLegacy(port, receiving)[0]._type).toBe("init-response");
        expect(receiving.get(canvas).width).toBe(100);
        expect(source.redo().ok).toBe(true);
        flushLegacy(port, receiving);
        expect(receiving.get(canvas).width).toBe(300);
        port.receive(JSON.stringify({ _type: "vault-action", _id: "unwanted-edit" }));
        expect(flushLegacy(port, receiving)[0]).toMatchObject({ _type: "vault-action-rejection", reason: "read-only" });
        source.getStore().setState({ iiif: source.getState().iiif });
        expect(flushLegacy(port, receiving)[0]._type).toBe("init-response");
      } finally {
        close();
      }
      source.modifyEntityField(canvas, "width", 400);
      expect(port.messages).toHaveLength(0);
    }
  );

  test("negotiates encoding per viewer without losing modern values", () => {
    const source = sourceVault(),
      legacy = new TestPort(),
      modern = new TestPort();
    const stopLegacy = createReadOnlyVaultBridge(source, legacy as unknown as MessagePort);
    const stopModern = createReadOnlyVaultBridge(source, modern as unknown as MessagePort);
    try {
      legacy.receive({ _type: "init-request" });
      modern.receive(stringifyVaultMessage({ _type: "init-request", protocol: 2 }));
      expect(JSON.parse(legacy.messages.shift()!)._type).toBe("init-response");
      expect(JSON.parse(modern.messages.shift()!)._vaultWire).toBe(1);
      source.modifyEntityField(canvas, "extra", { present: undefined, value: NaN });
      expect(JSON.parse(legacy.messages.shift()!)._type).toBe("vault-action");
      const message = parseVaultMessage(modern.messages.shift()!);
      expect(message.action.payload.actions[0].payload.value).toEqual({ present: undefined, value: NaN });
      expect(source.undo().ok).toBe(true);
      expect(JSON.parse(legacy.messages.shift()!)._type).toBe("init-response");
      expect(parseVaultMessage(modern.messages.shift()!).action.payload.actions[0].type).toBe("@iiif/APPLY_HISTORY");
      source.getStore().setState({ iiif: source.getState().iiif });
      expect(JSON.parse(legacy.messages.shift()!)._type).toBe("init-response");
      expect(parseVaultMessage(modern.messages.shift()!)._type).toBe("init-response");
      modern.receive(stringifyVaultMessage({ _type: "vault-action", _id: "unwanted-edit" }));
      expect(parseVaultMessage(modern.messages.shift()!)).toMatchObject({
        _type: "vault-action-rejection",
        reason: "read-only",
      });
    } finally {
      stopLegacy();
      stopModern();
    }
  });

  test("current MessagePort clients still initialise and follow edits and history", async () => {
    const source = sourceVault(),
      channel = new MessageChannel();
    const close = createReadOnlyVaultBridge(source, channel.port1);
    const client = new MessagePortClientVault(channel.port2);
    try {
      await client.waitUntilReady();
      expect(client.get(canvas).width).toBe(100);
      source.modifyEntityField(canvas, "width", 300);
      await vi.waitFor(() => expect(client.get(canvas).width).toBe(300));
      expect(source.undo().ok).toBe(true);
      await vi.waitFor(() => expect(client.get(canvas).width).toBe(100));
      expect(source.redo().ok).toBe(true);
      await vi.waitFor(() => expect(client.get(canvas).width).toBe(300));
    } finally {
      client.destroy();
      close();
    }
  });
});

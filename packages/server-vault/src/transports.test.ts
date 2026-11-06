import { expect, test, vi } from "vitest";
import { MessageChannel } from "node:worker_threads";
import { MessagePortClientVault, ClientVault } from "@manifest-editor/client-vault";
import { VaultAuthority } from "./authority";
import { MultiVaultServer } from "./server";

const canvas = { id: "c", type: "Canvas" as const };

test("MessagePort clients observe server-confirmed history and cleanly disconnect", async () => {
  const authority = new VaultAuthority();
  authority.vault.loadSync("c", { ...canvas, width: 10, height: 10 });
  const { port1, port2 } = new MessageChannel();
  const connection = authority.connect({ actorId: "alice", sessionId: "port" }, (wire) => port1.postMessage(wire));
  port1.on("message", connection.receive);
  const client = new MessagePortClientVault(port2 as unknown as globalThis.MessagePort);
  try {
    await client.waitUntilReady();
    client.modifyEntityField(canvas, "width", 20);
    await vi.waitFor(() => expect(client.getRemoteHistoryState().canUndo).toBe(true));
    expect((await client.requestHistory("undo")).ok).toBe(true);
    expect(client.get(canvas).width).toBe(10);
    expect(authority.vault.get(canvas).width).toBe(10);
  } finally {
    client.destroy();
    port1.close();
    connection.disconnect();
    authority.dispose();
  }
});

test("WebSocket clients with different credentials share a document and only undo their own work", async () => {
  const host = new MultiVaultServer(undefined, {
    authenticate: (request) => {
      const token = new URL(request.url!, "http://vault.local").searchParams.get("token");
      return token === "alice" || token === "bob" ? { actorId: token, sessionId: crypto.randomUUID() } : null;
    },
  });
  await new Promise<void>((resolve) => host.server.listen(0, "127.0.0.1", resolve));
  const address = host.server.address() as { port: number };
  const url = `ws://127.0.0.1:${address.port}/vault/shared`;
  const a = new ClientVault(`${url}?token=alice`),
    b = new ClientVault(`${url}?token=bob`);
  try {
    await Promise.all([a.waitUntilReady(), b.waitUntilReady()]);
    const room = host.vaults.get("shared")!;
    room.vault.loadSync("c", { ...canvas, width: 10, height: 10 });
    await vi.waitFor(() => expect(a.get(canvas)?.width).toBe(10));
    a.modifyEntityField(canvas, "width", 20);
    await vi.waitFor(() => expect(a.getRemoteHistoryState().canUndo).toBe(true));
    b.modifyEntityField(canvas, "label", { en: ["Bob"] });
    await vi.waitFor(() => expect(b.getRemoteHistoryState().canUndo).toBe(true));
    expect((await a.requestHistory("undo")).ok).toBe(true);
    await vi.waitFor(() => {
      expect(a.get(canvas).width).toBe(10);
      expect(b.get(canvas).width).toBe(10);
      expect(a.get(canvas).label).toEqual({ en: ["Bob"] });
    });
  } finally {
    a.ws.close();
    b.ws.close();
    for (const room of host.vaults.values()) await room.close();
    await new Promise<void>((resolve) => host.server.close(() => resolve()));
  }
});

test("unauthorized WebSocket clients fail readiness instead of hanging", async () => {
  const host = new MultiVaultServer(undefined, { authenticate: () => null });
  await new Promise<void>((resolve) => host.server.listen(0, "127.0.0.1", resolve));
  const address = host.server.address() as { port: number };
  const client = new ClientVault(`ws://127.0.0.1:${address.port}/vault/private`);
  try {
    await expect(client.waitUntilReady()).rejects.toThrow("Vault connection closed");
    expect(host.vaults.size).toBe(0);
    expect((await client.requestHistory("undo")).ok).toBe(false);
  } finally {
    client.ws.close();
    await new Promise<void>((resolve) => host.server.close(() => resolve()));
  }
});

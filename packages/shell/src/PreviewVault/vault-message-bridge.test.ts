import { parseVaultMessage } from "@manifest-editor/client-vault";
import { Vault } from "@iiif/helpers/vault";
import { entityActions } from "@iiif/helpers/vault/actions";
import { describe, expect, test, vi } from "vitest";
import { createIframeVaultBridge } from "./vault-message-bridge";

vi.mock("../helpers", () => ({ randomId: () => "test-action" }));

class TestPort {
  listener: ((event: MessageEvent) => void) | undefined;
  messages: string[] = [];

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

describe("createIframeVaultBridge", () => {
  test("mirrors canvas additions, moves, and deletions into the receiving vault", () => {
    const manifestId = "https://example.org/manifest";
    const firstCanvasId = "https://example.org/canvas/1";
    const secondCanvasId = "https://example.org/canvas/2";
    const source = new Vault();
    source.loadManifestSync(manifestId, {
      id: manifestId,
      type: "Manifest",
      label: { en: ["Test"] },
      items: [{ id: firstCanvasId, type: "Canvas", height: 100, width: 100 }],
    });

    const port = new TestPort();
    const cleanup = createIframeVaultBridge(source, port as unknown as MessagePort);
    port.receive(JSON.stringify({ _type: "init-request" }));

    const receiving = new Vault();
    const init = parseVaultMessage(port.messages.shift()!);
    receiving.getStore().setState(init.data);

    source.loadSync(secondCanvasId, {
      id: secondCanvasId,
      type: "Canvas",
      height: 100,
      width: 100,
    });
    source.dispatch(
      entityActions.addReference({
        id: manifestId,
        type: "Manifest",
        key: "items",
        reference: { id: secondCanvasId, type: "Canvas" },
      })
    );
    flushMirroredActions(port, receiving);
    expect(receiving.get({ id: manifestId, type: "Manifest" }).items.map((item: { id: string }) => item.id)).toEqual([
      firstCanvasId,
      secondCanvasId,
    ]);

    source.dispatch(
      entityActions.reorderEntityField({
        id: manifestId,
        type: "Manifest",
        key: "items",
        startIndex: 1,
        endIndex: 0,
      })
    );
    flushMirroredActions(port, receiving);
    expect(receiving.get({ id: manifestId, type: "Manifest" }).items.map((item: { id: string }) => item.id)).toEqual([
      secondCanvasId,
      firstCanvasId,
    ]);

    source.dispatch(
      entityActions.removeReference({
        id: manifestId,
        type: "Manifest",
        key: "items",
        reference: { id: secondCanvasId, type: "Canvas" },
        index: 0,
      })
    );
    flushMirroredActions(port, receiving);
    expect(receiving.get({ id: manifestId, type: "Manifest" }).items.map((item: { id: string }) => item.id)).toEqual([
      firstCanvasId,
    ]);

    cleanup();
  });
});

function flushMirroredActions(port: TestPort, receiving: Vault) {
  for (const message of port.messages.splice(0)) {
    const parsed = parseVaultMessage(message);
    if (parsed._type === "vault-action") {
      receiving.dispatch(parsed.action);
    }
  }
}

test("mirrors nested batches, undo and redo once, then releases the subscription", () => {
  const source = new Vault({ history: true }),
    port = new TestPort(),
    receiving = new Vault();
  source.loadSync("c", { id: "c", type: "Canvas", width: 100, height: 100 });
  const dispatch = source.dispatch;
  const close = createIframeVaultBridge(source, port as unknown as MessagePort);
  port.receive({ _type: "init-request" });
  receiving.getStore().setState(parseVaultMessage(port.messages.shift()!).data);
  source.batch(() => {
    source.modifyEntityField({ id: "c", type: "Canvas" }, "width", 300);
    source.batch(() => source.modifyEntityField({ id: "c", type: "Canvas" }, "height", 400));
  });
  expect(port.messages).toHaveLength(1);
  flushMirroredActions(port, receiving);
  expect(source.undo().ok).toBe(true);
  expect(port.messages).toHaveLength(1);
  flushMirroredActions(port, receiving);
  expect(receiving.get({ id: "c", type: "Canvas" }).width).toBe(100);
  expect(source.redo().ok).toBe(true);
  flushMirroredActions(port, receiving);
  expect(receiving.get({ id: "c", type: "Canvas" }).height).toBe(400);
  expect(source.dispatch).toBe(dispatch);
  source.getStore().setState({ iiif: source.getState().iiif });
  expect(parseVaultMessage(port.messages.shift()!)._type).toBe("init-response");
  close();
  source.modifyEntityField({ id: "c", type: "Canvas" }, "width", 500);
  expect(port.messages).toHaveLength(0);
});

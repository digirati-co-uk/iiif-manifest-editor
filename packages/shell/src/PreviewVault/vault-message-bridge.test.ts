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
    const cleanup = createIframeVaultBridge(
      source,
      port as unknown as MessagePort,
    );
    port.receive(JSON.stringify({ _type: "init-request" }));

    const receiving = new Vault();
    const init = JSON.parse(port.messages.shift()!);
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
      }),
    );
    flushMirroredActions(port, receiving);
    expect(
      receiving
        .get({ id: manifestId, type: "Manifest" })
        .items.map((item: { id: string }) => item.id),
    ).toEqual([firstCanvasId, secondCanvasId]);

    source.dispatch(
      entityActions.reorderEntityField({
        id: manifestId,
        type: "Manifest",
        key: "items",
        startIndex: 1,
        endIndex: 0,
      }),
    );
    flushMirroredActions(port, receiving);
    expect(
      receiving
        .get({ id: manifestId, type: "Manifest" })
        .items.map((item: { id: string }) => item.id),
    ).toEqual([secondCanvasId, firstCanvasId]);

    source.dispatch(
      entityActions.removeReference({
        id: manifestId,
        type: "Manifest",
        key: "items",
        reference: { id: secondCanvasId, type: "Canvas" },
        index: 0,
      }),
    );
    flushMirroredActions(port, receiving);
    expect(
      receiving
        .get({ id: manifestId, type: "Manifest" })
        .items.map((item: { id: string }) => item.id),
    ).toEqual([firstCanvasId]);

    cleanup();
  });
});

function flushMirroredActions(port: TestPort, receiving: Vault) {
  for (const message of port.messages.splice(0)) {
    const parsed = JSON.parse(message);
    if (parsed._type === "vault-action") {
      receiving.dispatch(parsed.action);
    }
  }
}

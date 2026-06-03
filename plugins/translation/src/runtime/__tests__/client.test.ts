import { describe, expect, test, vi } from "vitest";
import { createTranslationWorkerClient } from "../browser/client";
import type { TranslationWorkerResponse } from "../protocol";

class FakeWorker {
  readonly posted: unknown[] = [];
  readonly listeners = new Map<string, Set<(event: any) => void>>();
  readonly terminate = vi.fn();

  addEventListener(type: string, listener: (event: any) => void) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  postMessage(message: unknown) {
    this.posted.push(message);
  }

  emit(type: string, event: unknown) {
    for (const listener of this.listeners.get(type) || []) {
      listener(event);
    }
  }
}

describe("translation worker client", () => {
  test("sends preload requests and resolves worker responses", async () => {
    const worker = new FakeWorker();
    const client = createTranslationWorkerClient({ worker: worker as any });
    const promise = client.preload({ runtime: "wasm" });
    const request = worker.posted[0] as { requestId: string };

    worker.emit("message", {
      data: {
        kind: "success",
        command: "preload",
        requestId: request.requestId,
        payload: undefined,
      } satisfies TranslationWorkerResponse,
    });

    await expect(promise).resolves.toBeUndefined();
    expect(worker.posted[0]).toMatchObject({
      kind: "request",
      command: "preload",
      payload: { runtime: "wasm" },
    });
  });

  test("rejects pending requests and terminates the worker", async () => {
    const worker = new FakeWorker();
    const client = createTranslationWorkerClient({ worker: worker as any });
    const promise = client.translate({
      text: "Hello",
      sourceLanguage: "en",
      targetLanguage: "nl",
      runtime: "wasm",
    });

    client.terminate();

    await expect(promise).rejects.toThrow("terminated");
    expect(worker.terminate).toHaveBeenCalled();
  });
});

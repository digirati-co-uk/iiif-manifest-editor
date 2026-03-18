// @vitest-environment jsdom

import localforage from "localforage";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createThread,
  deleteThread,
  loadThreadsForDocument,
  setCurrentThread,
  updateThreadMessages,
} from "../thread-storage";
import {
  OPENROUTER_THREAD_STORAGE_NAME,
  OPENROUTER_THREAD_STORAGE_STORE,
} from "../constants";

const manifestMessage = {
  id: "msg-1",
  role: "user",
  parts: [{ type: "text", text: "Rename the manifest and add metadata" }],
} as any;

describe("thread storage", () => {
  beforeEach(async () => {
    await localforage.dropInstance({
      name: OPENROUTER_THREAD_STORAGE_NAME,
      storeName: OPENROUTER_THREAD_STORAGE_STORE,
    });
  });

  it("starts empty for a new mode/resource pair", async () => {
    await expect(loadThreadsForDocument("manifest", "https://example.org/manifest")).resolves.toEqual({
      key: "manifest:https://example.org/manifest",
      threads: [],
      currentThreadId: null,
    });
  });

  it("creates and reloads a first thread per mode/resource pair", async () => {
    const created = await createThread("manifest", "https://example.org/manifest");
    const reloaded = await loadThreadsForDocument("manifest", "https://example.org/manifest");

    expect(created.thread.id).toBeTruthy();
    expect(reloaded.threads).toHaveLength(1);
    expect(reloaded.currentThreadId).toBe(created.thread.id);
    expect(reloaded.threads[0]?.id).toBe(created.thread.id);
  });

  it("persists message metadata and derives the thread title from the first user message", async () => {
    const created = await createThread("manifest", "https://example.org/manifest");
    const updated = await updateThreadMessages(
      "manifest",
      "https://example.org/manifest",
      created.thread.id,
      [manifestMessage],
      {
        "msg-1": {
          modelId: "openrouter/auto",
          generatedAt: 123,
        },
      },
    );

    expect(updated?.threads[0]?.title).toBe("Rename the manifest and add metadata");
    expect(updated?.threads[0]?.messageMetadata).toEqual({
      "msg-1": {
        modelId: "openrouter/auto",
        generatedAt: 123,
      },
    });
  });

  it("tracks the current thread and falls back when the current thread is deleted", async () => {
    const first = await createThread("manifest", "https://example.org/manifest", "First");
    const second = await createThread("manifest", "https://example.org/manifest", "Second");

    const current = await setCurrentThread("manifest", "https://example.org/manifest", first.thread.id);
    expect(current.currentThreadId).toBe(first.thread.id);

    const deleted = await deleteThread("manifest", "https://example.org/manifest", first.thread.id);
    expect(deleted.currentThreadId).toBe(second.thread.id);
    expect(deleted.threads).toHaveLength(1);
  });
});

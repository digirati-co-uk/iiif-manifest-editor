// @vitest-environment jsdom

import localforage from "localforage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  OPENROUTER_THREAD_STORAGE_NAME,
  OPENROUTER_THREAD_STORAGE_STORE,
} from "../constants";
import { createOpenRouterStore } from "../store";

describe("openrouter store", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await localforage.dropInstance({
      name: OPENROUTER_THREAD_STORAGE_NAME,
      storeName: OPENROUTER_THREAD_STORAGE_STORE,
    });
  });

  it("auto-creates the first thread and defaults to chat view", async () => {
    const store = createOpenRouterStore();

    await store.getState().ensureThread("manifest", "https://example.org/manifest");

    const state = store.getState();
    expect(state.hydrated).toBe(true);
    expect(state.threads).toHaveLength(1);
    expect(state.currentThreadId).toBe(state.threads[0]?.id || null);
    expect(state.panelView).toBe("chat");
  });

  it("switches between thread list and chat views for new and selected threads", async () => {
    const store = createOpenRouterStore();

    await store.getState().ensureThread("manifest", "https://example.org/manifest");
    const firstThreadId = store.getState().currentThreadId!;

    store.getState().showThreads();
    expect(store.getState().panelView).toBe("threads");

    await store.getState().createThread("Second chat");
    expect(store.getState().panelView).toBe("chat");
    expect(store.getState().currentThreadId).not.toBe(firstThreadId);

    store.getState().showThreads();
    await store.getState().switchThread(firstThreadId);
    expect(store.getState().panelView).toBe("chat");
    expect(store.getState().currentThreadId).toBe(firstThreadId);
  });

  it("delegates submit, stop, and regenerate to the background controller bindings", async () => {
    const store = createOpenRouterStore();
    const submitMessage = vi.fn();
    const stopStreaming = vi.fn();
    const regenerateLastResponse = vi.fn();

    store.getState().bindControllerActions({
      submitMessage,
      stopStreaming,
      regenerateLastResponse,
    });

    await store.getState().submitPrompt("Rename the manifest");
    await store.getState().stopChat("document-switch");
    await store.getState().regenerateChat();

    expect(submitMessage).toHaveBeenCalledWith("Rename the manifest");
    expect(stopStreaming).toHaveBeenCalledWith("document-switch");
    expect(regenerateLastResponse).toHaveBeenCalled();
  });

  it("tracks floating launcher visibility separately from the chat thread state", async () => {
    const store = createOpenRouterStore();

    expect(store.getState().launcherOpen).toBe(false);

    store.getState().openLauncher();
    expect(store.getState().launcherOpen).toBe(true);

    await store.getState().ensureThread("manifest", "https://example.org/manifest");
    expect(store.getState().currentThreadId).toBeTruthy();
    expect(store.getState().launcherOpen).toBe(true);

    store.getState().toggleLauncher();
    expect(store.getState().launcherOpen).toBe(false);
  });
});

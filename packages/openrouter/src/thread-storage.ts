import localforage from "localforage";
import type { UIMessage } from "@ai-sdk/react";
import type { ToolMode } from "@manifest-editor/tools";
import {
  OPENROUTER_THREAD_STORAGE_NAME,
  OPENROUTER_THREAD_STORAGE_STORE,
} from "./constants";
import type {
  OpenRouterMessageMetadata,
  OpenRouterThread,
  OpenRouterThreadBucket,
} from "./types";

const threadStore = localforage.createInstance({
  name: OPENROUTER_THREAD_STORAGE_NAME,
  storeName: OPENROUTER_THREAD_STORAGE_STORE,
  description: "Thread storage for the manifest editor OpenRouter assistant",
});

export function getThreadStorageKey(mode: ToolMode, rootResourceId: string) {
  return `${mode}:${rootResourceId}`;
}

export function generateThreadId() {
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyBucket(key: string): OpenRouterThreadBucket {
  return {
    key,
    threads: [],
    currentThreadId: null,
  };
}

function getFirstMessageText(messages: UIMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user") as any;
  const firstTextPart = firstUserMessage?.parts?.find((part: any) => part?.type === "text");
  const text = typeof firstTextPart?.text === "string" ? firstTextPart.text.trim() : "";
  return text;
}

function deriveThreadTitle(existingTitle: string, messages: UIMessage[]) {
  if (!existingTitle.startsWith("Chat ")) {
    return existingTitle;
  }

  const firstText = getFirstMessageText(messages);
  if (!firstText) {
    return existingTitle;
  }

  return firstText.length > 48 ? `${firstText.slice(0, 48)}...` : firstText;
}

export async function loadThreadsForDocument(mode: ToolMode, rootResourceId: string) {
  const key = getThreadStorageKey(mode, rootResourceId);
  const stored = await threadStore.getItem<OpenRouterThreadBucket>(key);
  return stored || createEmptyBucket(key);
}

export async function saveThreadsForDocument(bucket: OpenRouterThreadBucket) {
  await threadStore.setItem(bucket.key, bucket);
}

export async function createThread(
  mode: ToolMode,
  rootResourceId: string,
  title?: string,
) {
  const existing = await loadThreadsForDocument(mode, rootResourceId);
  const thread: OpenRouterThread = {
    id: generateThreadId(),
    title: title || `Chat ${existing.threads.length + 1}`,
    messages: [],
    messageMetadata: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updated: OpenRouterThreadBucket = {
    ...existing,
    threads: [thread, ...existing.threads],
    currentThreadId: thread.id,
  };

  await saveThreadsForDocument(updated);
  return { thread, bucket: updated };
}

export async function updateThreadMessages(
  mode: ToolMode,
  rootResourceId: string,
  threadId: string,
  messages: UIMessage[],
  metadata: Record<string, OpenRouterMessageMetadata> = {},
) {
  const existing = await loadThreadsForDocument(mode, rootResourceId);
  const threadIndex = existing.threads.findIndex((thread) => thread.id === threadId);

  if (threadIndex === -1) {
    return null;
  }

  const currentThread = existing.threads[threadIndex]!;
  const updatedThread: OpenRouterThread = {
    ...currentThread,
    title: deriveThreadTitle(currentThread.title, messages),
    messages,
    messageMetadata: {
      ...currentThread.messageMetadata,
      ...metadata,
    },
    updatedAt: Date.now(),
  };

  const threads = [...existing.threads];
  threads[threadIndex] = updatedThread;

  const updated: OpenRouterThreadBucket = {
    ...existing,
    threads,
  };

  await saveThreadsForDocument(updated);
  return updated;
}

export async function setCurrentThread(
  mode: ToolMode,
  rootResourceId: string,
  threadId: string | null,
) {
  const existing = await loadThreadsForDocument(mode, rootResourceId);
  const updated: OpenRouterThreadBucket = {
    ...existing,
    currentThreadId: threadId,
  };

  await saveThreadsForDocument(updated);
  return updated;
}

export async function deleteThread(mode: ToolMode, rootResourceId: string, threadId: string) {
  const existing = await loadThreadsForDocument(mode, rootResourceId);
  const threads = existing.threads.filter((thread) => thread.id !== threadId);
  const currentThreadId =
    existing.currentThreadId === threadId ? threads[0]?.id || null : existing.currentThreadId;
  const updated: OpenRouterThreadBucket = {
    ...existing,
    threads,
    currentThreadId,
  };

  await saveThreadsForDocument(updated);
  return updated;
}

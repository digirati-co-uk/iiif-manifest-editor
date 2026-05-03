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

export function getProjectThreadStorageKey(projectId: string) {
  return `project:${projectId}`;
}

export function resolveThreadStorageKey(options: {
  assistantProjectId?: string | null;
  mode: ToolMode;
  rootResourceId: string;
}) {
  if (options.assistantProjectId) {
    return getProjectThreadStorageKey(options.assistantProjectId);
  }

  return getThreadStorageKey(options.mode, options.rootResourceId);
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

export async function loadThreadsForScope(threadScopeKey: string) {
  const stored = await threadStore.getItem<OpenRouterThreadBucket>(threadScopeKey);
  return stored || createEmptyBucket(threadScopeKey);
}

export async function saveThreadsForScope(bucket: OpenRouterThreadBucket) {
  await threadStore.setItem(bucket.key, bucket);
}

export async function createThread(
  threadScopeKey: string,
  title?: string,
) {
  const existing = await loadThreadsForScope(threadScopeKey);
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

  await saveThreadsForScope(updated);
  return { thread, bucket: updated };
}

export async function updateThreadMessages(
  threadScopeKey: string,
  threadId: string,
  messages: UIMessage[],
  metadata: Record<string, OpenRouterMessageMetadata> = {},
) {
  const existing = await loadThreadsForScope(threadScopeKey);
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

  await saveThreadsForScope(updated);
  return updated;
}

export async function setCurrentThread(
  threadScopeKey: string,
  threadId: string | null,
) {
  const existing = await loadThreadsForScope(threadScopeKey);
  const updated: OpenRouterThreadBucket = {
    ...existing,
    currentThreadId: threadId,
  };

  await saveThreadsForScope(updated);
  return updated;
}

export async function deleteThread(threadScopeKey: string, threadId: string) {
  const existing = await loadThreadsForScope(threadScopeKey);
  const threads = existing.threads.filter((thread) => thread.id !== threadId);
  const currentThreadId =
    existing.currentThreadId === threadId ? threads[0]?.id || null : existing.currentThreadId;
  const updated: OpenRouterThreadBucket = {
    ...existing,
    threads,
    currentThreadId,
  };

  await saveThreadsForScope(updated);
  return updated;
}

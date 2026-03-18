import { useMemo } from "react";
import type { UIMessage } from "@ai-sdk/react";
import { useAppResourceInstance } from "@manifest-editor/shell";
import type { ToolMode } from "@manifest-editor/tools";
import { useStore } from "zustand";
import { createStore, type StoreApi } from "zustand/vanilla";
import {
  buildOpenRouterAuthUrl,
  buildOpenRouterCallbackUrl,
  createOAuthState,
  generateCodeChallenge,
  generateCodeVerifier,
  logoutOpenRouter,
  openCenteredPopup,
} from "./auth";
import {
  OPENROUTER_DEFAULT_MODEL_ID,
  OPENROUTER_STORAGE_KEYS,
} from "./constants";
import {
  createThread,
  deleteThread,
  loadThreadsForScope,
  resolveThreadStorageKey,
  setCurrentThread,
  updateThreadMessages,
} from "./thread-storage";
import type {
  OpenRouterChatStatus,
  OpenRouterMessageMetadata,
  OpenRouterPanelView,
  OpenRouterStopReason,
  OpenRouterThread,
} from "./types";

type OpenRouterControllerBindings = {
  submitMessage: (text: string) => Promise<void> | void;
  stopStreaming: (reason?: OpenRouterStopReason) => Promise<void> | void;
  regenerateLastResponse: () => Promise<void> | void;
};

export interface OpenRouterStoreState {
  apiKey: string | null;
  loggedIn: boolean;
  authInProgress: boolean;
  error: string | null;
  selectedModelId: string;
  mode: ToolMode | null;
  rootResourceId: string | null;
  threadScopeKey: string | null;
  threads: OpenRouterThread[];
  currentThreadId: string | null;
  chatMessages: UIMessage[];
  messageMetadata: Record<string, OpenRouterMessageMetadata>;
  optionSelections: Record<string, string>;
  threadsLoading: boolean;
  hydrated: boolean;
  panelView: OpenRouterPanelView;
  chatStatus: OpenRouterChatStatus;
  chatError: string | null;
  controllerChatId: string | null;
  launcherOpen: boolean;
  setApiKey: (apiKey: string | null) => void;
  applyAuthError: (error: string | null) => void;
  clearError: () => void;
  setSelectedModelId: (modelId: string) => void;
  login: () => Promise<void>;
  logout: () => void;
  hydrateDocument: (input: {
    assistantProjectId?: string | null;
    mode: ToolMode;
    rootResourceId: string;
  }) => Promise<void>;
  ensureThread: (input: {
    assistantProjectId?: string | null;
    mode: ToolMode;
    rootResourceId: string;
  }) => Promise<void>;
  createThread: (title?: string) => Promise<OpenRouterThread | null>;
  switchThread: (threadId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  setChatMessages: (
    messages: UIMessage[],
    newMetadata?: Record<string, OpenRouterMessageMetadata>,
  ) => Promise<void>;
  clearCurrentThreadMessages: () => Promise<void>;
  bindControllerActions: (bindings: Partial<OpenRouterControllerBindings> | null) => void;
  setControllerState: (state: {
    chatStatus?: OpenRouterChatStatus;
    chatError?: string | null;
    controllerChatId?: string | null;
  }) => void;
  submitPrompt: (text: string) => Promise<void>;
  stopChat: (reason?: OpenRouterStopReason) => Promise<void>;
  regenerateChat: () => Promise<void>;
  showThreads: () => void;
  showChat: () => void;
  openLauncher: () => void;
  closeLauncher: () => void;
  toggleLauncher: () => void;
  setOptionSelection: (toolCallId: string, label: string) => void;
  clearOptionSelections: () => void;
}

const stores = new Map<string, StoreApi<OpenRouterStoreState>>();

function getStorage() {
  return typeof window !== "undefined" ? window.localStorage : null;
}

function getStoredApiKey() {
  return getStorage()?.getItem(OPENROUTER_STORAGE_KEYS.apiKey) || null;
}

function getStoredModelId() {
  return getStorage()?.getItem(OPENROUTER_STORAGE_KEYS.selectedModelId) || OPENROUTER_DEFAULT_MODEL_ID;
}

function createNoopControllerBindings(): OpenRouterControllerBindings {
  return {
    submitMessage: async () => {},
    stopStreaming: async () => {},
    regenerateLastResponse: async () => {},
  };
}

function getCurrentThread(
  threads: OpenRouterThread[],
  currentThreadId: string | null,
) {
  return (
    (currentThreadId && threads.find((thread) => thread.id === currentThreadId)) ||
    threads[0] ||
    null
  );
}

export function createOpenRouterStore() {
  let controllerBindings = createNoopControllerBindings();

  return createStore<OpenRouterStoreState>((set, get) => {
    const stopActiveRunIfNeeded = async (reason?: OpenRouterStopReason) => {
      const { chatStatus } = get();
      if (chatStatus !== "submitted" && chatStatus !== "streaming") {
        return;
      }
      await controllerBindings.stopStreaming(reason);
    };

    return {
      apiKey: getStoredApiKey(),
      loggedIn: !!getStoredApiKey(),
      authInProgress: false,
      error: null,
      selectedModelId: getStoredModelId(),
      mode: null,
      rootResourceId: null,
      threadScopeKey: null,
      threads: [],
      currentThreadId: null,
      chatMessages: [],
      messageMetadata: {},
      optionSelections: {},
      threadsLoading: false,
      hydrated: false,
      panelView: "chat",
      chatStatus: "ready",
      chatError: null,
      controllerChatId: null,
      launcherOpen: false,
      setApiKey(apiKey) {
        const storage = getStorage();
        if (storage) {
          if (apiKey) {
            storage.setItem(OPENROUTER_STORAGE_KEYS.apiKey, apiKey);
          } else {
            storage.removeItem(OPENROUTER_STORAGE_KEYS.apiKey);
          }
        }

        set({
          apiKey,
          loggedIn: !!apiKey,
          authInProgress: false,
          error: null,
        });
      },
      applyAuthError(error) {
        set({
          authInProgress: false,
          error,
        });
      },
      clearError() {
        set({ error: null });
      },
      setSelectedModelId(modelId) {
        getStorage()?.setItem(OPENROUTER_STORAGE_KEYS.selectedModelId, modelId);
        set({ selectedModelId: modelId });
      },
      async login() {
        try {
          const storage = getStorage();
          if (!storage) {
            throw new Error("OpenRouter login is only available in the browser.");
          }

          set({ authInProgress: true, error: null });
          const verifier = await generateCodeVerifier();
          const challenge = await generateCodeChallenge(verifier);
          const state = createOAuthState();
          storage.setItem(OPENROUTER_STORAGE_KEYS.pkceVerifier, verifier);
          storage.setItem(OPENROUTER_STORAGE_KEYS.oauthState, state);

          const authUrl = buildOpenRouterAuthUrl({
            callbackUrl: buildOpenRouterCallbackUrl(),
            codeChallenge: challenge,
            state,
          });
          const popup = openCenteredPopup(authUrl);

          if (!popup) {
            throw new Error("Failed to open the OpenRouter login popup. Please allow popups for this site.");
          }

          const popupCheckInterval = window.setInterval(() => {
            if (popup.closed) {
              window.clearInterval(popupCheckInterval);
              if (!get().loggedIn) {
                set({ authInProgress: false });
              }
            }
          }, 500);
        } catch (error) {
          set({
            authInProgress: false,
            error: error instanceof Error ? error.message : "Unable to start the OpenRouter login flow.",
          });
        }
      },
      logout() {
        const storage = getStorage();
        if (storage) {
          logoutOpenRouter(storage);
        }

        void stopActiveRunIfNeeded("logout");

        set({
          apiKey: null,
          loggedIn: false,
          authInProgress: false,
          error: null,
          chatError: null,
        });
      },
      async hydrateDocument(input) {
        const { assistantProjectId, mode, rootResourceId } = input;
        const threadScopeKey = resolveThreadStorageKey({
          assistantProjectId,
          mode,
          rootResourceId,
        });

        set({
          mode,
          rootResourceId,
          threadScopeKey,
          threads: [],
          currentThreadId: null,
          chatMessages: [],
          messageMetadata: {},
          optionSelections: {},
          threadsLoading: true,
          hydrated: false,
          panelView: "chat",
          chatError: null,
          controllerChatId: null,
          chatStatus: "ready",
        });

        const bucket = await loadThreadsForScope(threadScopeKey);
        if (get().threadScopeKey !== threadScopeKey) {
          return;
        }

        const currentThread = getCurrentThread(bucket.threads, bucket.currentThreadId);

        set({
          mode,
          rootResourceId,
          threadScopeKey,
          threads: bucket.threads,
          currentThreadId: currentThread?.id || null,
          chatMessages: currentThread?.messages || [],
          messageMetadata: currentThread?.messageMetadata || {},
          optionSelections: {},
          threadsLoading: false,
          hydrated: true,
          panelView: currentThread ? "chat" : "threads",
        });
      },
      async ensureThread(input) {
        const { assistantProjectId, mode, rootResourceId } = input;
        const threadScopeKey = resolveThreadStorageKey({
          assistantProjectId,
          mode,
          rootResourceId,
        });
        await get().hydrateDocument(input);

        if (get().threadScopeKey !== threadScopeKey) {
          return;
        }

        if (get().threads.length === 0) {
          set({ threadsLoading: true });
          await get().createThread();
          if (get().threadScopeKey === threadScopeKey) {
            set({ threadsLoading: false });
          }
          return;
        }

        if (get().currentThreadId) {
          set({ panelView: "chat" });
        }
      },
      async createThread(title) {
        const { threadScopeKey } = get();
        if (!threadScopeKey) {
          return null;
        }

        await stopActiveRunIfNeeded("new-thread");

        const created = await createThread(threadScopeKey, title);
        if (get().threadScopeKey !== threadScopeKey) {
          return null;
        }

        set({
          threads: created.bucket.threads,
          currentThreadId: created.thread.id,
          chatMessages: [],
          messageMetadata: {},
          optionSelections: {},
          threadsLoading: false,
          panelView: "chat",
          controllerChatId: null,
          chatError: null,
          chatStatus: "ready",
        });

        return created.thread;
      },
      async switchThread(threadId) {
        const { threads, threadScopeKey } = get();
        if (!threadScopeKey) {
          return;
        }

        const nextThread = threads.find((thread) => thread.id === threadId);
        if (!nextThread) {
          return;
        }

        await stopActiveRunIfNeeded("thread-switch");
        await setCurrentThread(threadScopeKey, threadId);
        if (get().threadScopeKey !== threadScopeKey) {
          return;
        }

        set({
          currentThreadId: threadId,
          chatMessages: nextThread.messages,
          messageMetadata: nextThread.messageMetadata || {},
          optionSelections: {},
          panelView: "chat",
          controllerChatId: null,
          chatError: null,
          chatStatus: "ready",
        });
      },
      async deleteThread(threadId) {
        const { threadScopeKey, panelView } = get();
        if (!threadScopeKey) {
          return;
        }

        await stopActiveRunIfNeeded("delete-thread");

        const updated = await deleteThread(threadScopeKey, threadId);
        if (get().threadScopeKey !== threadScopeKey) {
          return;
        }

        const currentThread = getCurrentThread(updated.threads, updated.currentThreadId);
        set({
          threads: updated.threads,
          currentThreadId: currentThread?.id || null,
          chatMessages: currentThread?.messages || [],
          messageMetadata: currentThread?.messageMetadata || {},
          optionSelections: {},
          panelView: currentThread ? panelView : "threads",
          controllerChatId: null,
          chatError: null,
          chatStatus: "ready",
        });
      },
      async setChatMessages(messages, newMetadata = {}) {
        const { currentThreadId, messageMetadata, threadScopeKey } = get();
        const mergedMetadata = {
          ...messageMetadata,
          ...newMetadata,
        };

        set({
          chatMessages: messages,
          messageMetadata: mergedMetadata,
        });

        if (!threadScopeKey || !currentThreadId) {
          return;
        }

        const updated = await updateThreadMessages(threadScopeKey, currentThreadId, messages, mergedMetadata);
        if (!updated) {
          return;
        }

        set({
          threads: updated.threads,
        });
      },
      async clearCurrentThreadMessages() {
        await get().setChatMessages([], {});
      },
      bindControllerActions(bindings) {
        controllerBindings = {
          ...createNoopControllerBindings(),
          ...bindings,
        };
      },
      setControllerState(state) {
        set((current) => ({
          chatStatus: state.chatStatus ?? current.chatStatus,
          chatError: typeof state.chatError === "undefined" ? current.chatError : state.chatError,
          controllerChatId:
            typeof state.controllerChatId === "undefined" ? current.controllerChatId : state.controllerChatId,
        }));
      },
      async submitPrompt(text) {
        set({
          panelView: "chat",
          chatError: null,
        });
        await controllerBindings.submitMessage(text);
      },
      async stopChat(reason = "user") {
        await controllerBindings.stopStreaming(reason);
      },
      async regenerateChat() {
        set({
          panelView: "chat",
          chatError: null,
        });
        await controllerBindings.regenerateLastResponse();
      },
      showThreads() {
        set({ panelView: "threads" });
      },
      showChat() {
        set({ panelView: "chat" });
      },
      openLauncher() {
        set({ launcherOpen: true });
      },
      closeLauncher() {
        set({ launcherOpen: false });
      },
      toggleLauncher() {
        set((state) => ({ launcherOpen: !state.launcherOpen }));
      },
      setOptionSelection(toolCallId, label) {
        set((state) => ({
          optionSelections: {
            ...state.optionSelections,
            [toolCallId]: label,
          },
        }));
      },
      clearOptionSelections() {
        set({ optionSelections: {} });
      },
    };
  });
}

export function getOrCreateOpenRouterStore(instanceId: string) {
  const existing = stores.get(instanceId);
  if (existing) {
    return existing;
  }

  const store = createOpenRouterStore();
  stores.set(instanceId, store);
  return store;
}

export function useOpenRouterStoreApi() {
  const instanceId = useAppResourceInstance();
  return useMemo(() => getOrCreateOpenRouterStore(instanceId), [instanceId]);
}

export function useOpenRouterStore<T>(selector: (state: OpenRouterStoreState) => T) {
  const store = useOpenRouterStoreApi();
  return useStore(store, selector);
}

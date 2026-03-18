import { useChat, type UIMessage } from "@ai-sdk/react";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  DirectChatTransport,
  ToolLoopAgent,
  jsonSchema,
  tool,
  type ToolSet,
} from "ai";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import toast, { Toaster } from "react-hot-toast";
import { useVault } from "react-iiif-vault";
import {
  useApp,
  useAppResource,
  useEditingResource,
  useEditingStack,
  useLayoutActions,
  useLayoutState,
  usePreviewContext,
  type BackgroundPanel,
} from "@manifest-editor/shell";
import { createManifestEditorToolRuntime, toAiSdkTools } from "@manifest-editor/tools";
import { handleOpenRouterCallback } from "./auth";
import {
  OPENROUTER_BACKGROUND_ID,
  OPENROUTER_PANEL_ID,
  OPENROUTER_POST_MESSAGE,
} from "./constants";
import { useOpenRouterStore, useOpenRouterStoreApi } from "./store";
import { useManifestEditorAiContext } from "./use-manifest-editor-ai-context";
import { buildOpenRouterNavigationToolDefinitions } from "./navigation-tools";
import { detectManifestEditorMode } from "./utils";
import type {
  OpenRouterChatStatus,
  OpenRouterStopReason,
  PresentOptionsPayload,
} from "./types";

function areMessagesEquivalent(left: UIMessage[], right: UIMessage[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index++) {
    if (left[index]?.id !== right[index]?.id || left[index]?.role !== right[index]?.role) {
      return false;
    }
  }

  return true;
}

function normalizeChatStatus(status: string, error?: Error | undefined): OpenRouterChatStatus {
  if (error) {
    return "error";
  }

  if (status === "streaming" || status === "submitted") {
    return status;
  }

  return "ready";
}

function OpenRouterToaster() {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          border: "1px solid #d1d5db",
          background: "#ffffff",
          color: "#111827",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        },
      }}
    />,
    document.body,
  );
}

function OpenRouterChatController(props: {
  isAssistantVisible: boolean;
}) {
  const app = useApp();
  const rootResource = useAppResource();
  const vault = useVault();
  const editingResource = useEditingResource();
  const editingStackActions = useEditingStack();
  const layout = useLayoutState();
  const layoutActions = useLayoutActions();
  const previewContext = usePreviewContext();
  const aiContext = useManifestEditorAiContext();
  const store = useOpenRouterStoreApi();
  const apiKey = useOpenRouterStore((state) => state.apiKey);
  const selectedModelId = useOpenRouterStore((state) => state.selectedModelId);
  const chatMessages = useOpenRouterStore((state) => state.chatMessages);
  const currentThreadId = useOpenRouterStore((state) => state.currentThreadId);
  const messageMetadata = useOpenRouterStore((state) => state.messageMetadata);
  const hydrated = useOpenRouterStore((state) => state.hydrated);
  const setChatMessages = useOpenRouterStore((state) => state.setChatMessages);
  const setControllerState = useOpenRouterStore((state) => state.setControllerState);

  const instructionsRef = useRef(aiContext.systemPrompt);
  const editingResourceRef = useRef(editingResource);
  const currentMessagesRef = useRef<UIMessage[]>(chatMessages);
  const lastMessageCountRef = useRef(0);
  const syncingFromStoreRef = useRef<{ chatId: string; messages: UIMessage[] } | null>(null);
  const pendingStopReasonRef = useRef<OpenRouterStopReason | null>(null);
  const previousStatusRef = useRef<OpenRouterChatStatus>("ready");
  const lastErrorToastRef = useRef<string | null>(null);

  instructionsRef.current = aiContext.systemPrompt;

  useEffect(() => {
    editingResourceRef.current = editingResource;
  }, [editingResource]);

  const runtime = useMemo(() => {
    return createManifestEditorToolRuntime({
      vault,
      rootResource,
      creators: app.layout.creators || [],
      onChange(event) {
        void previewContext.actions.updatePreviews();

        const currentEditingResource = editingResourceRef.current;
        const currentResource = currentEditingResource?.resource?.source;
        if (!currentResource) {
          return;
        }

        const touchedCurrentResource = [...event.result.changedRefs, ...event.result.createdRefs].some((ref) => {
          return ref.id === currentResource.id && ref.type === currentResource.type;
        });

        if (touchedCurrentResource && currentEditingResource) {
          editingStackActions.updateCurrent({ ...currentEditingResource });
        }
      },
    });
  }, [app.layout.creators, editingStackActions, previewContext.actions, rootResource, vault]);

  const tools = useMemo<ToolSet>(() => {
    const editorTools = Object.fromEntries(
      Object.entries(toAiSdkTools(runtime, { exposure: "default" })).map(([name, definition]) => [
        name,
        tool({
          description: definition.description,
          inputSchema: jsonSchema(definition.inputSchema),
          execute: definition.execute,
        }),
      ]),
    ) as ToolSet;
    const availableLeftPanelIds = new Set((app.layout.leftPanels || []).map((panel) => panel.id));
    const availableCenterPanelIds = new Set((app.layout.centerPanels || []).map((panel) => panel.id));
    const navigationDefinitions = buildOpenRouterNavigationToolDefinitions({
      vault,
      hasCanvasNavigation: availableLeftPanelIds.has("canvas-listing") && availableCenterPanelIds.has("current-canvas"),
      hasRangeNavigation:
        availableLeftPanelIds.has("@manifest-editor/ranges-listing") &&
        availableCenterPanelIds.has("range-workbench"),
      currentLayout: {
        leftPanelId: layout.leftPanel.current,
        centerPanelId: layout.centerPanel.current,
        rightPanelId: layout.rightPanel.current,
        rightPanelTab: layout.rightPanel.state?.currentTab || null,
      },
      focusCanvas(resource) {
        layoutActions.open({ id: "canvas-listing" });
        layoutActions.open({ id: "current-canvas" });
        layoutActions.edit(resource, undefined, { forceOpen: true });
      },
      focusRange(resource) {
        layoutActions.open({ id: "@manifest-editor/ranges-listing" });
        layoutActions.open({ id: "range-workbench" });
        layoutActions.edit(resource);
      },
    });
    const navigationTools = Object.fromEntries(
      navigationDefinitions.map((definition) => [
        definition.name,
        tool({
          description: definition.description,
          inputSchema: jsonSchema(definition.inputSchema),
          execute: definition.execute,
        }),
      ]),
    ) as ToolSet;

    return {
      ...editorTools,
      ...navigationTools,
      present_options: tool<PresentOptionsPayload, PresentOptionsPayload>({
        description: "Present a small set of discrete UI choices for the user to pick from.",
        inputSchema: jsonSchema<PresentOptionsPayload>({
          type: "object",
          additionalProperties: false,
          required: ["options"],
          properties: {
            prompt: { type: "string" },
            options: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["label"],
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        }),
        execute: async (input) => input,
      }),
    };
  }, [app.layout.centerPanels, app.layout.leftPanels, layout, layoutActions, runtime, vault]);

  const model = useMemo(() => {
    if (!apiKey) {
      return null;
    }
    return createOpenRouter({ apiKey }).chat(selectedModelId, {});
  }, [apiKey, selectedModelId]);

  const agent = useMemo(() => {
    if (!model) {
      return null;
    }

    return new ToolLoopAgent({
      model,
      tools,
      toolChoice: "auto",
      prepareCall: async (options) => ({
        ...options,
        instructions: instructionsRef.current,
      }),
    });
  }, [model, tools]);

  const chatId = `${currentThreadId || "pending"}:${selectedModelId}`;
  const { messages, sendMessage, regenerate, status, setMessages, stop, error } = useChat<UIMessage>({
    id: chatId,
    transport: agent ? new DirectChatTransport({ agent }) : undefined,
  } as any);

  useEffect(() => {
    currentMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    store.getState().bindControllerActions({
      submitMessage: async (text) => {
        pendingStopReasonRef.current = null;
        if (!currentThreadId) {
          return;
        }
        await sendMessage({ text });
        store.getState().showChat();
      },
      stopStreaming: async (reason) => {
        pendingStopReasonRef.current = reason || "user";
        stop();
      },
      regenerateLastResponse: async () => {
        pendingStopReasonRef.current = null;
        await regenerate();
        store.getState().showChat();
      },
    });

    return () => {
      store.getState().bindControllerActions(null);
    };
  }, [currentThreadId, regenerate, sendMessage, stop, store]);

  useEffect(() => {
    if (areMessagesEquivalent(currentMessagesRef.current, chatMessages)) {
      return;
    }

    syncingFromStoreRef.current = {
      chatId,
      messages: chatMessages,
    };
    setMessages(chatMessages);
    lastMessageCountRef.current = chatMessages.length;
  }, [chatId, chatMessages, setMessages]);

  useEffect(() => {
    if (!hydrated || !currentThreadId) {
      return;
    }

    const syncingSnapshot = syncingFromStoreRef.current;
    if (syncingSnapshot && syncingSnapshot.chatId === chatId) {
      if (areMessagesEquivalent(messages, syncingSnapshot.messages)) {
        syncingFromStoreRef.current = null;
        lastMessageCountRef.current = messages.length;
      }
      return;
    }

    const newMetadata: Record<string, { modelId: string; generatedAt: number }> = {};
    for (let index = lastMessageCountRef.current; index < messages.length; index++) {
      const message = messages[index];
      if (message && message.role === "assistant" && !messageMetadata[message.id]) {
        newMetadata[message.id] = {
          modelId: selectedModelId,
          generatedAt: Date.now(),
        };
      }
    }

    lastMessageCountRef.current = messages.length;
    const delay = status === "streaming" || status === "submitted" ? 250 : 0;
    const persistTimeout = window.setTimeout(() => {
      void setChatMessages(messages, newMetadata);
    }, delay);

    return () => {
      window.clearTimeout(persistTimeout);
    };
  }, [
    chatId,
    currentThreadId,
    hydrated,
    messageMetadata,
    messages,
    selectedModelId,
    setChatMessages,
    status,
  ]);

  useEffect(() => {
    setControllerState({
      chatStatus: normalizeChatStatus(status, error),
      chatError: error?.message || null,
      controllerChatId: currentThreadId ? chatId : null,
    });
  }, [chatId, currentThreadId, error, setControllerState, status]);

  useEffect(() => {
    const nextStatus = normalizeChatStatus(status, error);
    const previousStatus = previousStatusRef.current;
    const wasActive = previousStatus === "submitted" || previousStatus === "streaming";
    const pendingStopReason = pendingStopReasonRef.current;

    if (wasActive && nextStatus === "ready" && !pendingStopReason && !props.isAssistantVisible) {
      toast.success("AI response complete.");
    }

    if (wasActive && nextStatus === "error" && error?.message && !props.isAssistantVisible) {
      if (lastErrorToastRef.current !== error.message) {
        toast.error(error.message);
        lastErrorToastRef.current = error.message;
      }
    }

    if (wasActive && nextStatus !== "submitted" && nextStatus !== "streaming") {
      pendingStopReasonRef.current = null;
    }

    if (nextStatus !== "error") {
      lastErrorToastRef.current = null;
    }

    previousStatusRef.current = nextStatus;
  }, [error, props.isAssistantVisible, status]);

  return null;
}

function OpenRouterBackgroundEffects() {
  const app = useApp();
  const rootResource = useAppResource();
  const store = useOpenRouterStoreApi();
  const layout = useLayoutState();
  const mode = useMemo(() => {
    return detectManifestEditorMode({
      rootResource,
      creators: app.layout.creators || [],
    });
  }, [app.layout.creators, rootResource]);
  const previousDocumentKeyRef = useRef<string | null>(null);
  const isAssistantVisible = layout.leftPanel.open && layout.leftPanel.current === OPENROUTER_PANEL_ID;
  const assistantVisibilityRef = useRef(isAssistantVisible);

  useEffect(() => {
    assistantVisibilityRef.current = isAssistantVisible;
  }, [isAssistantVisible]);

  useEffect(() => {
    const nextDocumentKey = `${mode}:${rootResource.id}`;
    const previousDocumentKey = previousDocumentKeyRef.current;
    previousDocumentKeyRef.current = nextDocumentKey;

    const syncThreads = async () => {
      const state = store.getState();
      const isDocumentSwitch = previousDocumentKey !== null && previousDocumentKey !== nextDocumentKey;
      const isActiveRun = state.chatStatus === "submitted" || state.chatStatus === "streaming";

      if (isDocumentSwitch && isActiveRun) {
        await state.stopChat("document-switch");
        if (!assistantVisibilityRef.current) {
          toast("Stopped the active chat because you switched documents.");
        }
      }

      await store.getState().ensureThread(mode, rootResource.id);
    };

    void syncThreads();
  }, [mode, rootResource.id, store]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === OPENROUTER_POST_MESSAGE.success && typeof event.data.apiKey === "string") {
        store.getState().setApiKey(event.data.apiKey);
      }

      if (event.data?.type === OPENROUTER_POST_MESSAGE.error && typeof event.data.error === "string") {
        store.getState().applyAuthError(event.data.error);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [store]);

  useEffect(() => {
    void handleOpenRouterCallback({
      history: window.history,
      closeWindow: () => window.close(),
    }).then((result) => {
      if (!result.handled) {
        return;
      }

      if ("apiKey" in result && result.apiKey) {
        store.getState().setApiKey(result.apiKey);
      }

      if ("error" in result && result.error) {
        store.getState().applyAuthError(result.error);
      }
    });
  }, [store]);

  return (
    <>
      <OpenRouterChatController isAssistantVisible={isAssistantVisible} />
      <OpenRouterToaster />
    </>
  );
}

export const openRouterBackgroundTask: BackgroundPanel = {
  id: OPENROUTER_BACKGROUND_ID,
  label: "OpenRouter background",
  render: () => <OpenRouterBackgroundEffects />,
};

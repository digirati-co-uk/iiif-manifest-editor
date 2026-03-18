import { type UIMessage, useChat } from "@ai-sdk/react";
import {
  useApp,
  useAppResource,
  useEditingResource,
  useEditingStack,
  useLayoutActions,
  useLayoutState,
  usePreviewContext,
} from "@manifest-editor/shell";
import { createManifestEditorToolRuntime, toAiSdkTools } from "@manifest-editor/tools";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { DirectChatTransport, jsonSchema, ToolLoopAgent, type ToolSet, tool } from "ai";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import toast, { type Toast, Toaster } from "react-hot-toast";
import { useVault } from "react-iiif-vault";
import { handleOpenRouterCallback } from "./auth";
import { OPENROUTER_POST_MESSAGE } from "./constants";
import { buildOpenRouterNavigationToolDefinitions } from "./navigation-tools";
import { useOpenRouterStore, useOpenRouterStoreApi } from "./store";
import type { OpenRouterChatStatus, OpenRouterStopReason, PresentOptionsPayload } from "./types";
import { useManifestEditorAiContext } from "./use-manifest-editor-ai-context";
import { detectManifestEditorMode } from "./utils";

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

function ToastIcon({ type }: { type: "success" | "error" | "info" }) {
  if (type === "success") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0 text-me-primary-500"
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (type === "error") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0 text-red-500"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 0 0-1.061 1.06L9.94 10l-2.06 2a.75.75 0 1 0 1.06 1.06L11 11.06l2-2.06a.75.75 0 1 0-1.06-1.06L10 9.94l-2-2.06a.75.75 0 0 0-.06.06Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0 text-me-gray-500"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function getToastType(t: Toast): "success" | "error" | "info" {
  if (t.type === "success") return "success";
  if (t.type === "error") return "error";
  return "info";
}

function OpenRouterToaster() {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="manifest-editor">
      <Toaster
        position="bottom-right"
        containerStyle={{
          bottom: 84,
          right: 12,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            all: "unset",
          },
        }}
      >
        {(t) => {
          const type = getToastType(t);
          return (
            <div
              className={[
                "flex max-w-[320px] items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-snug shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]",
                "transition-all duration-200",
                t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                type === "error"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : type === "success"
                    ? "border-me-primary-100 bg-me-primary-50 text-me-gray-900"
                    : "border-me-gray-300 bg-white text-me-gray-900",
              ].join(" ")}
            >
              <ToastIcon type={type} />
              <span className="min-w-0 flex-1">{t.message as React.ReactNode}</span>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-none bg-transparent text-me-gray-500 transition-colors hover:text-me-gray-900 cursor-pointer"
                aria-label="Dismiss"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
          );
        }}
      </Toaster>
    </div>,
    document.body,
  );
}

function OpenRouterChatController(props: { isAssistantVisible: boolean }) {
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
        availableLeftPanelIds.has("@manifest-editor/ranges-listing") && availableCenterPanelIds.has("range-workbench"),
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
  }, [chatId, currentThreadId, hydrated, messageMetadata, messages, selectedModelId, setChatMessages, status]);

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

export function OpenRouterControllerHost(props: { isAssistantVisible: boolean }) {
  const app = useApp();
  const rootResource = useAppResource();
  const store = useOpenRouterStoreApi();
  const mode = useMemo(() => {
    return detectManifestEditorMode({
      rootResource,
      creators: app.layout.creators || [],
    });
  }, [app.layout.creators, rootResource]);
  const previousDocumentKeyRef = useRef<string | null>(null);
  const assistantVisibilityRef = useRef(props.isAssistantVisible);

  useEffect(() => {
    assistantVisibilityRef.current = props.isAssistantVisible;
  }, [props.isAssistantVisible]);

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
      <OpenRouterChatController isAssistantVisible={props.isAssistantVisible} />
      <OpenRouterToaster />
    </>
  );
}

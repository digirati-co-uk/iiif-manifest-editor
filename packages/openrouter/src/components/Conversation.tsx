import { useLayoutActions } from "@manifest-editor/shell";
import toast from "react-hot-toast";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { copyTextToClipboard, formatConversationForClipboard } from "../conversation-export";
import { useOpenRouterStore } from "../store";
import { useManifestEditorAiContext } from "../use-manifest-editor-ai-context";
import { useOpenRouterModels } from "../use-openrouter-models";
import { MessageList } from "./MessageList";
import { PromptInput } from "./PromptInput";

function getStatusColor(status: string, error?: string | null) {
  if (error) return "bg-me-gray-900";
  if (status === "submitted" || status === "streaming") return "bg-me-primary-500 animate-pulse";
  return "bg-me-primary-500";
}

function OverflowMenu({
  onNewThread,
  onCopyConversation,
  onClearThread,
  onDisconnect,
  canCopyConversation,
}: {
  onNewThread: () => void;
  onCopyConversation: () => void;
  onClearThread: () => void;
  onDisconnect: () => void;
  canCopyConversation: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-6 w-6 items-center justify-center rounded text-me-gray-500 hover:bg-me-gray-100 hover:text-me-gray-900"
        aria-label="More actions"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-auto whitespace-nowrap rounded border border-me-gray-300 bg-white py-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => {
              onNewThread();
              setOpen(false);
            }}
            className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[11px] text-me-gray-700 hover:bg-me-gray-100 hover:text-me-gray-900"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="6" y1="2" x2="6" y2="10" />
              <line x1="2" y1="6" x2="10" y2="6" />
            </svg>
            New thread
          </button>
          <button
            type="button"
            disabled={!canCopyConversation}
            onClick={() => {
              onCopyConversation();
              setOpen(false);
            }}
            className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[11px] text-me-gray-700 hover:bg-me-gray-100 hover:text-me-gray-900 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-me-gray-700"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="2" width="6" height="7" rx="1" />
              <path d="M4.5 10H8a1 1 0 001-1V4.5" />
            </svg>
            Copy conversation
          </button>
          <button
            type="button"
            onClick={() => {
              onClearThread();
              setOpen(false);
            }}
            className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[11px] text-me-gray-700 hover:bg-me-gray-100 hover:text-me-gray-900"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h8M4 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 6v3M7 6v3M3 4l.5 6a1 1 0 001 1h3a1 1 0 001-1L9 4" />
            </svg>
            Clear messages
          </button>
          <div className="my-0.5 border-t border-me-gray-100" />
          <button
            type="button"
            onClick={() => {
              onDisconnect();
              setOpen(false);
            }}
            className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[11px] text-me-gray-700 hover:bg-me-gray-100"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 4l-4 4M4 4l4 4" />
            </svg>
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CompactModelSelector({
  disabled,
  models,
  selectedModelId,
  onSelectModel,
}: {
  disabled: boolean;
  models: { id: string; name: string }[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
}) {
  return (
    <div className="flex max-w-full items-center gap-1 overflow-hidden border-b border-me-gray-100 px-2.5 py-1">
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="shrink-0 text-me-gray-500"
      >
        <rect x="1" y="3" width="10" height="6" rx="1" />
        <circle cx="4" cy="6" r="1" />
        <line x1="7" y1="5" x2="9" y2="5" />
        <line x1="7" y1="7" x2="9" y2="7" />
      </svg>
      <select
        value={selectedModelId}
        disabled={disabled}
        onChange={(e) => onSelectModel(e.target.value)}
        className="min-w-0 flex-1 cursor-pointer truncate border-none bg-transparent py-0 text-[12px] text-me-gray-700 outline-none focus:text-me-gray-900 disabled:cursor-default disabled:opacity-50"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Conversation() {
  const layoutActions = useLayoutActions();
  const aiContext = useManifestEditorAiContext();
  const apiKey = useOpenRouterStore((state) => state.apiKey);
  const selectedModelId = useOpenRouterStore((state) => state.selectedModelId);
  const setSelectedModelId = useOpenRouterStore((state) => state.setSelectedModelId);
  const threads = useOpenRouterStore((state) => state.threads);
  const currentThreadId = useOpenRouterStore((state) => state.currentThreadId);
  const chatMessages = useOpenRouterStore((state) => state.chatMessages);
  const messageMetadata = useOpenRouterStore((state) => state.messageMetadata);
  const optionSelections = useOpenRouterStore((state) => state.optionSelections);
  const setOptionSelection = useOpenRouterStore((state) => state.setOptionSelection);
  const clearCurrentThreadMessages = useOpenRouterStore((state) => state.clearCurrentThreadMessages);
  const chatStatus = useOpenRouterStore((state) => state.chatStatus);
  const chatError = useOpenRouterStore((state) => state.chatError);
  const showThreads = useOpenRouterStore((state) => state.showThreads);
  const submitPrompt = useOpenRouterStore((state) => state.submitPrompt);
  const stopChat = useOpenRouterStore((state) => state.stopChat);
  const regenerateChat = useOpenRouterStore((state) => state.regenerateChat);
  const createThread = useOpenRouterStore((state) => state.createThread);
  const logout = useOpenRouterStore((state) => state.logout);
  const { models } = useOpenRouterModels({
    apiKey,
    enabled: !!apiKey,
    toolsOnly: true,
  });

  const deferredMessages = useDeferredValue(chatMessages);
  const deferredMessageMetadata = useDeferredValue(messageMetadata);
  const currentThread = useMemo(() => {
    return threads.find((thread) => thread.id === currentThreadId) || null;
  }, [currentThreadId, threads]);

  const handleOpenRef = useCallback(
    (ref: { id: string; type: string }) => layoutActions.edit(ref, undefined, { forceOpen: true }),
    [layoutActions],
  );
  const handleSubmit = useCallback(
    (text: string) => {
      void submitPrompt(text);
    },
    [submitPrompt],
  );
  const handleStop = useCallback(() => {
    void stopChat("user");
  }, [stopChat]);
  const handleRegenerate = useCallback(() => {
    void regenerateChat();
  }, [regenerateChat]);
  const handleSelectOption = useCallback(
    (toolCallId: string, label: string) => {
      setOptionSelection(toolCallId, label);
      void submitPrompt(label);
    },
    [setOptionSelection, submitPrompt],
  );
  const handleNewThread = useCallback(() => {
    void createThread();
  }, [createThread]);
  const handleClearThread = useCallback(() => {
    void clearCurrentThreadMessages();
  }, [clearCurrentThreadMessages]);
  const handleCopyConversation = useCallback(() => {
    const text = formatConversationForClipboard({
      title: currentThread?.title || "Conversation",
      messages: chatMessages,
    });

    if (!text.trim()) {
      toast("Nothing to copy.");
      return;
    }

    void copyTextToClipboard(text)
      .then(() => {
        toast.success("Copied conversation.");
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to copy conversation.");
      });
  }, [chatMessages, currentThread?.title]);

  return (
    <div className="flex min-h-0 max-w-full flex-1 flex-col">
      {/* Slim header bar */}
      <div className="relative z-10 shrink-0 border-b border-me-gray-300 bg-white">
        <div className="flex h-9 max-w-full items-center gap-1.5 px-2">
          <button
            type="button"
            onClick={showThreads}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-me-gray-500 hover:bg-me-gray-100 hover:text-me-gray-900"
            aria-label="Back to threads"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="10,3 5,8 10,13" />
            </svg>
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
            <span
              className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${getStatusColor(chatStatus, chatError)}`}
              title={chatError ? `Error: ${chatError}` : chatStatus}
            />
            <span className="min-w-0 truncate text-xs font-medium text-me-gray-900">
              {currentThread?.title || "Conversation"}
            </span>
          </div>
          <OverflowMenu
            onNewThread={handleNewThread}
            onCopyConversation={handleCopyConversation}
            onClearThread={handleClearThread}
            onDisconnect={logout}
            canCopyConversation={chatMessages.length > 0}
          />
        </div>
        <CompactModelSelector
          disabled={chatStatus === "streaming" || chatStatus === "submitted"}
          models={models}
          selectedModelId={selectedModelId}
          onSelectModel={setSelectedModelId}
        />
      </div>

      {/* Message list - takes all available space */}
      <MessageList
        messages={deferredMessages}
        status={chatStatus}
        error={chatError || undefined}
        messageMetadata={deferredMessageMetadata}
        optionSelections={optionSelections}
        onOpenRef={handleOpenRef}
        onRegenerate={handleRegenerate}
        onSelectOption={handleSelectOption}
      />

      {/* Subtle context hint */}
      {aiContext.currentSelection ? (
        <div className="flex max-w-full shrink-0 items-center gap-1 overflow-hidden border-t border-me-gray-100 px-2.5 py-0.5">
          <svg
            width="8"
            height="8"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="shrink-0 text-me-gray-500"
          >
            <circle cx="5" cy="5" r="4" />
            <circle cx="5" cy="5" r="1.5" fill="currentColor" />
          </svg>
          <span className="truncate text-[10px] text-me-gray-500">{aiContext.currentSelection.type}</span>
        </div>
      ) : null}

      {/* Prompt input */}
      <PromptInput
        disabled={!apiKey || !currentThreadId}
        isStreaming={chatStatus === "streaming" || chatStatus === "submitted"}
        onStop={handleStop}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

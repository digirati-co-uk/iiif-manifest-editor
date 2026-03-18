import type { UIMessage } from "@ai-sdk/react";
import { memo, useEffect, useMemo, useRef } from "react";
import type { OpenRouterMessageMetadata } from "../types";
import { ToolResultRenderer } from "./ToolResultRenderer";

function isToolPart(part: any): part is any {
  return part?.type === "dynamic-tool" || (typeof part?.type === "string" && part.type.startsWith("tool-"));
}

function TypingIndicator() {
  return (
    <div className="flex items-start py-0.5">
      <div className="flex items-center gap-1 px-1">
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-me-gray-500 [animation-delay:0ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-me-gray-500 [animation-delay:150ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-me-gray-500 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-2.5 w-2.5"
    >
      <path d="M13.5 2.5v4h-4" />
      <path d="M2.5 8a5.5 5.5 0 0 1 9.27-4L13.5 6.5" />
      <path d="M2.5 13.5v-4h4" />
      <path d="M13.5 8a5.5 5.5 0 0 1-9.27 4L2.5 9.5" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 text-me-gray-300"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MessageListInner(props: {
  messages: UIMessage[];
  status: string;
  error?: string;
  messageMetadata: Record<string, OpenRouterMessageMetadata>;
  optionSelections: Record<string, string>;
  onOpenRef: (ref: { id: string; type: string }) => void;
  onRegenerate: () => void;
  onSelectOption: (toolCallId: string, label: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [props.messages, props.status]);

  const lastAssistantMessageId = useMemo(() => {
    return [...props.messages].reverse().find((message) => message.role === "assistant")?.id || null;
  }, [props.messages]);

  const isStreaming = props.status === "streaming" || props.status === "submitted";

  if (props.messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-8 text-center">
        <ChatIcon />
        <p className="text-xs leading-relaxed text-me-gray-500">
          Ask me to inspect, create, or edit resources in your manifest.
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-2 py-2">
      <div className="flex max-w-full flex-col gap-2">
        {props.messages.map((message) => {
          const isUser = message.role === "user";

          if (isUser) {
            return (
              <article key={message.id} className="flex max-w-full justify-end mb-3 px-1">
                <div className="ml-8 min-w-0 max-w-[85%] rounded-lg rounded-br-none bg-me-primary-500 px-2.5 py-1.5 text-white">
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <div
                          key={`${message.id}-text-${index}`}
                          className="whitespace-pre-wrap break-words text-[12px] leading-relaxed"
                        >
                          {part.text}
                        </div>
                      );
                    }
                    if (part.type === "file") {
                      return (
                        <a
                          key={`${message.id}-file-${index}`}
                          href={part.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-[12px] text-white underline"
                        >
                          {part.filename || part.url}
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
              </article>
            );
          }

          // Assistant message — plain text, no bubble/border/background
          return (
            <article key={message.id} className="max-w-full mb-3">
              <div className="flex max-w-full flex-col gap-1.5 overflow-hidden px-1">
                {message.parts.map((part, index) => {
                  if (part.type === "step-start") {
                    return null;
                  }

                  if (part.type === "text") {
                    return (
                      <div
                        key={`${message.id}-text-${index}`}
                        className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-me-gray-900"
                      >
                        {part.text}
                      </div>
                    );
                  }

                  if (part.type === "reasoning") {
                    return (
                      <details
                        key={`${message.id}-reasoning-${index}`}
                        className="max-w-full overflow-hidden rounded bg-me-gray-100 px-2 py-1"
                      >
                        <summary className="cursor-pointer select-none text-[12px] text-me-gray-500">Thinking…</summary>
                        <div className="mt-1 whitespace-pre-wrap break-words text-[12px] leading-relaxed text-me-gray-700">
                          {part.text}
                        </div>
                      </details>
                    );
                  }

                  if (part.type === "file") {
                    return (
                      <a
                        key={`${message.id}-file-${index}`}
                        href={part.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-[12px] text-me-primary-600 underline"
                      >
                        {part.filename || part.url}
                      </a>
                    );
                  }

                  if (isToolPart(part)) {
                    const toolPart = part as any;
                    return (
                      <ToolResultRenderer
                        key={`${message.id}-tool-${index}`}
                        part={toolPart}
                        onOpenRef={props.onOpenRef}
                        onSelectOption={props.onSelectOption}
                        selectedOptionText={props.optionSelections[toolPart.toolCallId]}
                      />
                    );
                  }

                  return null;
                })}

                {message.id === lastAssistantMessageId && props.status === "ready" ? (
                  <div className="flex">
                    <button
                      type="button"
                      onClick={props.onRegenerate}
                      title="Regenerate response"
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-me-gray-500 transition-colors hover:bg-me-gray-100 hover:text-me-primary-600"
                    >
                      <RefreshIcon />
                      <span className="text-[12px]">Retry</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}

        {isStreaming && props.messages[props.messages.length - 1]?.role === "user" ? <TypingIndicator /> : null}

        {props.error ? (
          <div className="flex max-w-full items-start gap-1.5 overflow-hidden rounded bg-me-gray-100 px-2 py-1.5 text-[12px] text-me-gray-900">
            <span className="shrink-0">⚠</span>
            <span className="min-w-0 break-words">{props.error}</span>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export const MessageList = memo(MessageListInner);

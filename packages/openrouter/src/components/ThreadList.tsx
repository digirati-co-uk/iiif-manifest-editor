import type { OpenRouterThread } from "../types";

function formatUpdatedAt(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export function ThreadList(props: {
  currentThreadId: string | null;
  threads: OpenRouterThread[];
  threadsLoading?: boolean;
  onCreateThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onDisconnect: () => void;
  onSelectThread: (threadId: string) => void;
}) {
  return (
    <div className="flex min-h-0 max-w-full flex-1 flex-col overflow-hidden">
      <div className="flex max-w-full shrink-0 items-center justify-between overflow-hidden border-b border-me-gray-300 px-2.5 py-1.5">
        <button
          type="button"
          onClick={props.onCreateThread}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[12px] font-medium text-me-primary-600 hover:bg-me-primary-50"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="shrink-0">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New
        </button>
        <button
          type="button"
          onClick={props.onDisconnect}
          className="rounded px-1.5 py-1 text-[12px] text-me-gray-500 hover:text-me-gray-700"
        >
          Disconnect
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-0.5">
        {props.threadsLoading ? (
          <div className="flex h-full items-center justify-center px-2.5 text-[12px] text-me-gray-500">Loading…</div>
        ) : null}

        {!props.threadsLoading && props.threads.length === 0 ? (
          <div className="px-3 py-5 text-center text-[12px] text-me-gray-500">
            No conversations yet.
            <br />
            <button
              type="button"
              onClick={props.onCreateThread}
              className="mt-1.5 text-[12px] text-me-primary-600 hover:text-me-primary-500"
            >
              Start a new conversation
            </button>
          </div>
        ) : null}

        <div className="flex flex-col">
          {props.threads.map((thread) => {
            const isCurrent = thread.id === props.currentThreadId;

            return (
              <div
                key={thread.id}
                className={[
                  "group relative flex items-center",
                  isCurrent
                    ? "border-l-2 border-me-primary-500 bg-me-primary-50"
                    : "border-l-2 border-transparent hover:bg-me-gray-100",
                ].join(" ")}
              >
                <button
                  type="button"
                  onClick={() => props.onSelectThread(thread.id)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-1.5 px-2.5 py-1.5 text-left"
                >
                  <span
                    className={[
                      "min-w-0 truncate text-[12px]",
                      isCurrent ? "font-medium text-me-gray-900" : "text-me-gray-700",
                    ].join(" ")}
                  >
                    {thread.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-me-gray-500">{formatUpdatedAt(thread.updatedAt)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => props.onDeleteThread(thread.id)}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-me-gray-500 opacity-0 transition-opacity hover:bg-me-gray-300 hover:text-me-gray-900 group-hover:opacity-100"
                  aria-label={`Delete ${thread.title}`}
                >
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

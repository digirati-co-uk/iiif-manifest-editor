import { ActionButton, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useOpenRouterStore } from "../store";
import { Conversation } from "./Conversation";
import { ThreadList } from "./ThreadList";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    </svg>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10">
      <div className="flex gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full bg-me-primary-500"
          style={{ animation: "pulse 1.2s ease-in-out infinite" }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-me-primary-500"
          style={{ animation: "pulse 1.2s ease-in-out 0.2s infinite" }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-me-primary-500"
          style={{ animation: "pulse 1.2s ease-in-out 0.4s infinite" }}
        />
      </div>
      <p className="text-xs text-me-gray-500">Loading conversations…</p>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mx-2 mt-2 flex max-w-full items-start gap-1.5 overflow-hidden rounded border border-me-gray-300 bg-me-gray-100 px-2 py-2">
      <span className="shrink-0 text-[12px]">⚠</span>
      <p className="min-w-0 flex-1 break-words text-[12px] leading-snug text-me-gray-900">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 text-me-gray-500 hover:bg-me-gray-300 hover:text-me-gray-900"
        aria-label="Dismiss error"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
          <path d="M12.207 4.793a1 1 0 0 1 0 1.414L9.414 9l2.793 2.793a1 1 0 0 1-1.414 1.414L8 10.414l-2.793 2.793a1 1 0 0 1-1.414-1.414L6.586 9 3.793 6.207a1 1 0 0 1 1.414-1.414L8 7.586l2.793-2.793a1 1 0 0 1 1.414 0z" />
        </svg>
      </button>
    </div>
  );
}

function LoginScreen({ onLogin, authInProgress }: { onLogin: () => void; authInProgress: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-me-primary-50">
        <SparkleIcon className="h-5 w-5 text-me-primary-500" />
      </div>

      <h3 className="mt-3 text-center text-xs font-semibold text-me-gray-900">AI Assistant</h3>
      <p className="mt-1.5 max-w-full text-center text-[12px] leading-relaxed text-me-gray-500">
        Connect your OpenRouter account to get started. Your API key stays in your browser.
      </p>

      <div className="mt-4 w-full max-w-full">
        <ActionButton
          primary
          className="w-full justify-center"
          onPress={() => void onLogin()}
          isDisabled={authInProgress}
        >
          {authInProgress ? "Connecting…" : "Connect OpenRouter"}
        </ActionButton>
      </div>
    </div>
  );
}

export function OpenRouterPanel() {
  const apiKey = useOpenRouterStore((state) => state.apiKey);
  const loggedIn = useOpenRouterStore((state) => state.loggedIn);
  const authInProgress = useOpenRouterStore((state) => state.authInProgress);
  const error = useOpenRouterStore((state) => state.error);
  const clearError = useOpenRouterStore((state) => state.clearError);
  const login = useOpenRouterStore((state) => state.login);
  const logout = useOpenRouterStore((state) => state.logout);
  const threads = useOpenRouterStore((state) => state.threads);
  const currentThreadId = useOpenRouterStore((state) => state.currentThreadId);
  const threadsLoading = useOpenRouterStore((state) => state.threadsLoading);
  const hydrated = useOpenRouterStore((state) => state.hydrated);
  const panelView = useOpenRouterStore((state) => state.panelView);
  const createThread = useOpenRouterStore((state) => state.createThread);
  const switchThread = useOpenRouterStore((state) => state.switchThread);
  const deleteThread = useOpenRouterStore((state) => state.deleteThread);

  return (
    <Sidebar>
      <SidebarContent className="flex max-w-full flex-col p-0">
        {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

        {!loggedIn || !apiKey ? (
          <LoginScreen onLogin={login} authInProgress={authInProgress} />
        ) : !hydrated && threadsLoading ? (
          <LoadingIndicator />
        ) : panelView === "threads" ? (
          <ThreadList
            currentThreadId={currentThreadId}
            threads={threads}
            threadsLoading={threadsLoading}
            onCreateThread={() => void createThread()}
            onDeleteThread={(threadId) => void deleteThread(threadId)}
            onDisconnect={logout}
            onSelectThread={(threadId) => void switchThread(threadId)}
          />
        ) : (
          <Conversation />
        )}
      </SidebarContent>
    </Sidebar>
  );
}

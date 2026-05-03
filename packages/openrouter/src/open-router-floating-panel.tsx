import { type FloatingPanel, useConfig, useMatchMedia } from "@manifest-editor/shell";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { OpenRouterPanel } from "./components";
import { OPENROUTER_FLOATING_PANEL_ID } from "./constants";
import { OpenRouterControllerHost } from "./controller-host";
import { useOpenRouterStore } from "./store";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function StatusDot({ status, error }: { status: string; error: string | null }) {
  if (status === "streaming" || status === "submitted") {
    return (
      <span className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-ai-pulse bg-me-primary-500" />
    );
  }

  if (error) {
    return <span className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-red-500" />;
  }

  return null;
}

export function OpenRouterAssistantDock() {
  const launcherOpen = useOpenRouterStore((state) => state.launcherOpen);
  const toggleLauncher = useOpenRouterStore((state) => state.toggleLauncher);
  const closeLauncher = useOpenRouterStore((state) => state.closeLauncher);
  const chatStatus = useOpenRouterStore((state) => state.chatStatus);
  const chatError = useOpenRouterStore((state) => state.chatError);
  const [isMobile] = useMatchMedia(["(max-width: 640px)"]);

  useEffect(() => {
    if (!launcherOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLauncher();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeLauncher, launcherOpen]);

  const portalContent = (
    <div className="manifest-editor">
      {/* Backdrop for mobile */}
      {launcherOpen && isMobile ? (
        <button
          type="button"
          aria-label="Close AI assistant"
          onClick={closeLauncher}
          className="fixed inset-0 z-[9999998] h-full w-full cursor-default border-none bg-black/30 p-0 animate-ai-backdrop-in"
        />
      ) : null}

      {/* Chat panel */}
      <div
        role="dialog"
        aria-label="AI assistant"
        aria-hidden={!launcherOpen}
        className={[
          "fixed z-[9999999] flex flex-col overflow-hidden border border-me-gray-300 bg-white",
          // Sizing – mobile vs desktop
          isMobile
            ? "inset-x-0 bottom-0 h-[80dvh] w-full rounded-t-2xl"
            : "bottom-[88px] right-5 h-[min(70vh,640px)] w-[400px] max-w-[calc(100vw-40px)] rounded-2xl",
          // Never go off the top of the screen
          "max-h-[calc(100dvh-100px)]",
          // Shadow + transform origin
          isMobile ? "origin-bottom" : "origin-bottom-right",
          // Open / close transitions
          launcherOpen
            ? "opacity-100 pointer-events-auto animate-ai-panel-in shadow-[0_24px_80px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.08)]"
            : "opacity-0 pointer-events-none translate-y-3 scale-[0.96] transition-[opacity,transform] duration-150 ease-out shadow-none",
        ].join(" ")}
      >
        {/* Panel header */}
        <div className="flex shrink-0 items-center justify-between border-b border-me-gray-100 bg-me-gray-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-me-primary-500">
              <SparkleIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-me-gray-900">AI Assistant</span>
          </div>
          <button
            type="button"
            onClick={closeLauncher}
            aria-label="Close AI assistant"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-none bg-transparent text-me-gray-500 transition-colors duration-100 hover:bg-me-gray-300 hover:text-me-gray-900 cursor-pointer"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Panel content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <OpenRouterPanel />
        </div>
      </div>

      {/* FAB button */}
      <button
        type="button"
        aria-label={launcherOpen ? "Close AI assistant" : "Open AI assistant"}
        onClick={toggleLauncher}
        className={[
          "fixed bottom-5 right-5 z-[10000000] flex h-14 w-14 items-center justify-center rounded-full border-none cursor-pointer text-white outline-none",
          "animate-ai-fab-in transition-[background,box-shadow,transform] duration-300 ease-out",
          "hover:scale-110 active:scale-95",
          launcherOpen
            ? "bg-me-gray-900 shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:bg-black"
            : "bg-me-primary-500 shadow-[0_8px_28px_rgba(184,76,116,0.4),0_2px_8px_rgba(0,0,0,0.1)] hover:bg-me-primary-600",
        ].join(" ")}
      >
        <StatusDot status={chatStatus} error={chatError} />
        <span
          className={[
            "flex items-center justify-center transition-transform duration-300",
            launcherOpen ? "rotate-90" : "rotate-0",
          ].join(" ")}
        >
          {launcherOpen ? <CloseIcon className="h-[22px] w-[22px]" /> : <SparkleIcon className="h-[22px] w-[22px]" />}
        </span>
      </button>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(portalContent, document.body);
}

function OpenRouterFloatingAssistant() {
  const { editorFeatureFlags: { openRouterAssistant = false } = {} } = useConfig();
  const launcherOpen = useOpenRouterStore((state) => state.launcherOpen);
  const closeLauncher = useOpenRouterStore((state) => state.closeLauncher);

  useEffect(() => {
    if (!openRouterAssistant) {
      closeLauncher();
    }
  }, [closeLauncher, openRouterAssistant]);

  if (!openRouterAssistant) {
    return null;
  }

  return (
    <>
      <OpenRouterControllerHost isAssistantVisible={launcherOpen} />
      <OpenRouterAssistantDock />
    </>
  );
}

export const openRouterFloatingPanel: FloatingPanel = {
  id: OPENROUTER_FLOATING_PANEL_ID,
  label: "AI assistant",
  render: () => <OpenRouterFloatingAssistant />,
};

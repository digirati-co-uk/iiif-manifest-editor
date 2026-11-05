import type { HistoryResult, HistoryState, Vault } from "@iiif/helpers/vault";
import { finishVaultEditSessions } from "@manifest-editor/editor-api";
import { useTranslations } from "@manifest-editor/i18n";
import { DefaultTooltipContent, RedoIcon, Tooltip, TooltipTrigger, UndoIcon } from "@manifest-editor/components";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useVault } from "react-iiif-vault";

type RemoteHistory = Vault & {
  historyEnabled: boolean;
  lastRejection?: string;
  getRemoteHistoryState(): HistoryState;
  subscribeRemoteHistory(cb: () => void): () => void;
  requestHistory(direction: "undo" | "redo"): Promise<HistoryResult>;
};
const empty: HistoryState = { undo: [], redo: [], canUndo: false, canRedo: false };

export function createHistoryAdapter(vault: Vault) {
  const remote = "requestHistory" in vault ? (vault as RemoteHistory) : undefined;
  let state = remote?.getRemoteHistoryState() || vault.history?.getState() || empty;
  const listeners = new Set<() => void>();
  let stop: (() => void) | undefined;
  const update = (next?: HistoryState) => {
    state = next || remote?.getRemoteHistoryState() || empty;
    for (const listener of listeners) listener();
  };
  return {
    getSnapshot: () => state,
    enabled: () => (remote ? remote.historyEnabled : !!vault.history),
    error: () => remote?.lastRejection,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (!stop) {
        stop = remote ? remote.subscribeRemoteHistory(() => update()) : vault.history?.subscribe(update);
        // Close the gap between rendering and subscribing.
        state = remote?.getRemoteHistoryState() || vault.history?.getState() || empty;
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          stop?.();
          stop = undefined;
        }
      };
    },
    async apply(direction: "undo" | "redo") {
      finishVaultEditSessions(vault);
      return remote ? remote.requestHistory(direction) : vault[direction]();
    },
  };
}

type HistoryContextValue = {
  state: HistoryState;
  enabled: boolean;
  pending: boolean;
  result?: HistoryResult;
  error?: string;
  failure?: string;
  apply(direction: "undo" | "redo"): Promise<void>;
  /** Hosts that place `<HistoryControls inline />` in their own header register here. */
  registerInline(): () => void;
  hasInline: boolean;
};
const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const vault = useVault();
  const adapter = useMemo(() => createHistoryAdapter(vault), [vault]);
  const state = useSyncExternalStore(adapter.subscribe, adapter.getSnapshot, adapter.getSnapshot);
  const [result, setResult] = useState<HistoryResult>();
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string>();
  const inFlight = useRef(false);
  const [inlineCount, setInlineCount] = useState(0);
  const registerInline = useMemo(
    () => () => {
      setInlineCount((count) => count + 1);
      return () => setInlineCount((count) => count - 1);
    },
    []
  );
  const apply = async (direction: "undo" | "redo") => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setFailure(undefined);
    try {
      setResult(await adapter.apply(direction));
    } catch (error) {
      setResult(undefined);
      setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (event.defaultPrevented || event.nativeEvent.isComposing || event.altKey || !(event.ctrlKey || event.metaKey))
      return;
    if (
      target.closest(
        "input,textarea,select,[contenteditable]:not([contenteditable='false']),.cm-editor,[data-native-undo]"
      )
    )
      return;
    if (target.closest("[data-vault-history-root]") !== event.currentTarget) return;
    const key = event.key.toLowerCase();
    const direction = key === "z" ? (event.shiftKey ? "redo" : "undo") : key === "y" && event.ctrlKey ? "redo" : null;
    if (!direction || !adapter.enabled()) return;
    event.preventDefault();
    void apply(direction);
  };
  return (
    <HistoryContext.Provider
      value={{
        state,
        enabled: adapter.enabled(),
        pending,
        result,
        error: adapter.error(),
        failure,
        apply,
        registerInline,
        hasInline: inlineCount > 0,
      }}
    >
      <div data-vault-history-root="" style={{ display: "contents" }} onKeyDown={onKeyDown}>
        {children}
      </div>
    </HistoryContext.Provider>
  );
}

export function HistoryControls({
  inline,
  variant = "light",
}: {
  /** Render for a host's own header: sits in its button row, with a divider after it. */
  inline?: boolean;
  /** "dark" matches the focused-exhibition header. */
  variant?: "light" | "dark";
} = {}) {
  const vault = useVault();
  const history = useContext(HistoryContext);
  const t = useTranslations("shell");
  const registerInline = history?.registerInline;
  useLayoutEffect(() => (inline ? registerInline?.() : undefined), [inline, registerInline]);
  if (!history?.enabled) return null;
  const dark = variant === "dark";
  const { state, pending, apply, result } = history;
  const disabledReason = (direction: "undo" | "redo") => {
    if (pending) return t("history.busy");
    const group = state[direction].at(-1);
    return t(!group ? "history.empty" : group.status === "open" ? "history.open" : "history.conflict");
  };
  const tooltip = (direction: "undo" | "redo") => {
    const canApply = direction === "undo" ? state.canUndo : state.canRedo;
    if (!canApply || pending) return disabledReason(direction);
    const group = state[direction].at(-1);
    return group?.label ? t(`history.${direction}Operation`, { label: group.label }) : t(`history.${direction}`);
  };
  const failure = history.failure || (result && !result.ok ? t(`history.${result.reason}`) : "");
  const button = (direction: "undo" | "redo") => {
    const canApply = direction === "undo" ? state.canUndo : state.canRedo;
    const Icon = direction === "undo" ? UndoIcon : RedoIcon;
    const unavailable = !canApply || pending;
    return (
      <Tooltip placement="bottom">
        <TooltipTrigger asChild>
          {/* aria-disabled keeps the button focusable so its tooltip can explain why it is unavailable. */}
          <button
            type="button"
            aria-label={t(`history.${direction}`)}
            aria-disabled={unavailable}
            data-history-action={direction}
            className={`rounded-md p-1 text-2xl focus:outline-none focus-visible:ring-2 ${
              dark
                ? "border border-white/20 bg-white/10 text-white focus-visible:ring-white/60"
                : "border-0 bg-me-gray-100 text-me-primary-500 focus-visible:ring-me-primary-500"
            } ${
              unavailable
                ? "cursor-default opacity-40"
                : dark
                  ? "cursor-pointer hover:bg-white/15"
                  : "cursor-pointer hover:bg-me-primary-500 hover:text-white"
            }`}
            onClick={() => {
              if (!unavailable) void apply(direction);
            }}
          >
            <Icon aria-hidden />
          </button>
        </TooltipTrigger>
        <DefaultTooltipContent>{tooltip(direction)}</DefaultTooltipContent>
      </Tooltip>
    );
  };
  return (
    <div
      role="group"
      className={`flex shrink-0 items-center gap-2 ${inline ? "" : "px-3"}`}
      onPointerDownCapture={() => finishVaultEditSessions(vault)}
      onFocusCapture={() => finishVaultEditSessions(vault)}
      aria-label={t("history.title")}
    >
      {button("undo")}
      {button("redo")}
      {inline && <span aria-hidden className={`mx-1 h-6 w-px ${dark ? "bg-white/20" : "bg-me-gray-300"}`} />}
      {history.error && (
        <span role="alert" className="max-w-56 truncate text-xs text-red-700" title={t("history.syncConflict")}>
          {t("history.syncConflict")}
        </span>
      )}
      <output
        className={failure ? "max-w-56 truncate text-xs text-red-700" : "sr-only"}
        title={failure}
        aria-live="polite"
      >
        {failure}
      </output>
    </div>
  );
}

export function HistoryHeader({ children }: { children: ReactNode }) {
  const history = useContext(HistoryContext);
  return (
    <div className="flex min-w-0 items-center">
      <div className="min-w-0 flex-1">{children}</div>
      {/* A host that places the controls in its own header suppresses this fallback. */}
      {history?.hasInline ? null : <HistoryControls />}
    </div>
  );
}

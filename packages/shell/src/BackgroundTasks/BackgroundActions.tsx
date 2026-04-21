import {
  BackgroundActionMenuButton,
  BackgroundActionMenuActionButton,
  BackgroundActionMenuDivider,
  BackgroundActionMenuInfoButton,
  BackgroundActionMenuInlineAction,
  BackgroundActionMenuItem,
  BackgroundActionMenuLabel,
  BackgroundActionMenuMeta,
  BackgroundActionMenuPanel,
  BackgroundActionMenuProgressBar,
  BackgroundActionMenuRoot,
  BackgroundActionMenuSection,
  BackgroundActionMenuStatusDot,
  BackgroundActionMenuText,
  BackgroundActionMenuTrigger,
  Modal,
} from "@manifest-editor/components";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { useVault } from "react-iiif-vault";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { useConfig } from "../ConfigContext/ConfigContext";
import { useEditingResource, useEditingResourceStack } from "../EditingStack/EditingStack";
import { useLayoutActions, useLayoutState } from "../Layout/Layout.context";
import { createManifestEditorCanvasProgressApi } from "../CanvasProgress";
import { createManifestEditorTagsApi } from "../Tags";
import { useToasts } from "../Toast/ToastContext";
import { getBackgroundActionToastContent, getBackgroundActionToastDedupKey } from "./BackgroundActionToasts.helpers";
import {
  getAvailableBackgroundActionGroups,
  runBackgroundAction,
  useBackgroundActionsStore,
  useBackgroundActionsStoreApi,
} from "./BackgroundTasksStore";
import type {
  BackgroundActionDefinition,
  BackgroundActionGroup,
  BackgroundActionInstance,
  BackgroundActionContext,
  BackgroundActionSystemContext,
  BackgroundActionTarget,
} from "./BackgroundTasks.types";

function toRootTarget(resource: { id: string; type: string }): BackgroundActionTarget {
  return {
    id: resource.id,
    type: resource.type,
    label: resource.type,
    scope: "root",
  };
}

function toCanvasTarget(resource: { id?: string; type?: string } | undefined): BackgroundActionTarget | undefined {
  if (!resource || !resource.id || resource.type !== "Canvas") {
    return undefined;
  }

  return {
    id: resource.id,
    type: "Canvas",
    label: "Current canvas",
    scope: "canvas",
  };
}

function useCurrentCanvasTarget() {
  const current = useEditingResource();
  const stack = useEditingResourceStack();

  return useMemo(() => {
    const canvasResource = [current, ...stack].find((item) => item?.resource?.source?.type === "Canvas");
    return toCanvasTarget(canvasResource?.resource?.source);
  }, [current, stack]);
}

function useBackgroundActionSystemContext(): BackgroundActionSystemContext {
  const rootResource = useAppResource();
  const currentCanvas = useCurrentCanvasTarget();
  const vault = useVault();
  const tags = useMemo(() => createManifestEditorTagsApi(vault), [vault]);
  const canvasProgress = useMemo(() => createManifestEditorCanvasProgressApi(vault), [vault]);
  const config = useConfig();
  const layoutState = useLayoutState();
  const layoutActions = useLayoutActions();

  return useMemo(
    () => ({
      rootResource,
      currentCanvas,
      vault,
      tags,
      canvasProgress,
      config,
      layoutState,
      layoutActions,
    }),
    [rootResource, currentCanvas, vault, tags, canvasProgress, config, layoutState, layoutActions],
  );
}

export function useAvailableBackgroundActions(): BackgroundActionGroup[] {
  const definitions = useBackgroundActionsStore((state) => state.definitions);
  const instances = useBackgroundActionsStore((state) => state.instances);
  const systemContext = useBackgroundActionSystemContext();
  const rootTarget = useMemo(() => toRootTarget(systemContext.rootResource), [systemContext.rootResource]);

  return useMemo(() => {
    const targets = [rootTarget, ...(systemContext.currentCanvas ? [systemContext.currentCanvas] : [])];
    return getAvailableBackgroundActionGroups({
      definitions,
      instances,
      systemContext,
      targets,
      onSupportsError: (definition, error) => {
        console.error(`Background action "${definition.id}" failed support check`, error);
      },
    });
  }, [definitions, instances, rootTarget, systemContext]);
}

export function BackgroundActionsMount() {
  const definitions = useBackgroundActionsStore((state) => state.definitions);
  const systemContext = useBackgroundActionSystemContext();

  return (
    <>
      {definitions.map((definition) => {
        if (!definition.render) {
          return null;
        }

        return <Fragment key={definition.id}>{definition.render({ ...systemContext, definition })}</Fragment>;
      })}
    </>
  );
}

export function BackgroundActionToasts() {
  const definitions = useBackgroundActionsStore((state) => state.definitions);
  const instances = useBackgroundActionsStore((state) => state.instances);
  const systemContext = useBackgroundActionSystemContext();
  const toasts = useToasts();
  const shownToastKeys = useRef(new Set<string>());

  const definitionsById = useMemo(
    () => new Map(definitions.map((definition) => [definition.id, definition])),
    [definitions],
  );

  useEffect(() => {
    for (const instance of Object.values(instances)) {
      const dedupKey = getBackgroundActionToastDedupKey(instance);
      if (!dedupKey || shownToastKeys.current.has(dedupKey)) {
        continue;
      }

      const definition = definitionsById.get(instance.actionId);
      if (!definition) {
        continue;
      }

      const context: BackgroundActionContext = {
        ...systemContext,
        definition,
        target: instance.target,
        instanceKey: instance.id,
        instance,
      };
      const content = getBackgroundActionToastContent(
        definition,
        instance,
        instance.resultsAvailable && definition.onResults
          ? () => {
              void definition.onResults?.(context);
            }
          : undefined,
      );

      if (content) {
        toasts.add(content);
        shownToastKeys.current.add(dedupKey);
      }
    }
  }, [definitionsById, instances, systemContext, toasts]);

  return null;
}

function isBusy(instance: BackgroundActionInstance | undefined) {
  return instance?.status === "preparing" || instance?.status === "running";
}

function getActionStatusLabel(instance: BackgroundActionInstance | undefined) {
  if (!instance || instance.status === "idle") {
    return "";
  }

  if (instance.status === "error") {
    return instance.error?.message || instance.statusText || "Error";
  }

  if (instance.status === "complete" && instance.resultsAvailable) {
    return "Results ready";
  }

  if (instance.status === "cancelled") {
    return "Cancelled";
  }

  return instance.statusText || instance.status;
}

function formatTimestamp(value: number | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleString();
}

function formatTime(value: number | undefined) {
  if (!value) return "--:--:--";
  return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDuration(instance: BackgroundActionInstance) {
  if (!instance.startedAt) {
    return "Not recorded";
  }

  const end = instance.completedAt || Date.now();
  const seconds = Math.max(0, Math.round((end - instance.startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function formatJson(value: unknown) {
  if (typeof value === "undefined") {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</dt>
      <dd className="mt-1 break-words text-sm text-zinc-800">{value}</dd>
    </div>
  );
}

const logLevelConfig: Record<string, { label: string; className: string }> = {
  debug: { label: "DBG", className: "text-zinc-500" },
  verbose: { label: "VRB", className: "text-zinc-500" },
  info: { label: "INF", className: "text-sky-400" },
  log: { label: "LOG", className: "text-zinc-300" },
  warn: { label: "WRN", className: "text-amber-400" },
  warning: { label: "WRN", className: "text-amber-400" },
  error: { label: "ERR", className: "text-red-400" },
};

function getLogLevelConfig(level: string) {
  return logLevelConfig[level?.toLowerCase()] ?? { label: level?.toUpperCase().slice(0, 3) ?? "LOG", className: "text-zinc-300" };
}

const milestoneEventBadgeClass: Record<string, string> = {
  error: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  success: "bg-green-100 text-green-700",
  started: "bg-sky-100 text-sky-700",
  cancelled: "bg-zinc-100 text-zinc-600",
  warning: "bg-amber-100 text-amber-700",
  warn: "bg-amber-100 text-amber-700",
};

function getMilestoneBadgeClass(type: string) {
  return milestoneEventBadgeClass[type?.toLowerCase()] ?? "bg-zinc-100 text-zinc-600";
}

function isMilestoneEvent(type: string) {
  return type?.toLowerCase() in milestoneEventBadgeClass;
}

type DetailsTab = "overview" | "logs";

function BackgroundActionDetailsModal({
  definition,
  instance,
  onClose,
}: {
  definition: BackgroundActionDefinition;
  instance: BackgroundActionInstance;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailsTab>("overview");
  const logEndRef = useRef<HTMLDivElement>(null);
  const logCount = instance.logs.length;

  // Auto-scroll log terminal to bottom when switching to logs tab
  useEffect(() => {
    if (activeTab === "logs") {
      logEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [activeTab]);

  const statusColourMap: Record<string, string> = {
    idle: "bg-zinc-100 text-zinc-600",
    preparing: "bg-orange-100 text-orange-700",
    running: "bg-orange-100 text-orange-700",
    complete: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    cancelled: "bg-zinc-100 text-zinc-500",
  };

  // Only show milestone events in the overview (filter out high-frequency progress ticks)
  const milestoneEvents = instance.events.filter((e) => isMilestoneEvent(e.type));

  const tabs: Array<{ id: DetailsTab; label: string; count?: number }> = [
    { id: "overview", label: "Overview" },
    { id: "logs", label: "Logs", count: logCount },
  ];

  return (
    <Modal title={instance.label || definition.label} onClose={onClose} className="max-w-3xl">
      {/* Tab bar — sticky inside the scroll container */}
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-2">
        <div className="flex gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors -mb-px",
                activeTab === tab.id
                  ? "border-me-primary-500 font-semibold text-me-primary-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-800",
              ].join(" ")}
            >
              {tab.label}
              {tab.count ? (
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-5 p-5">
          {/* Status row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                statusColourMap[instance.status] ?? "bg-zinc-100 text-zinc-600",
              ].join(" ")}
            >
              {instance.status}
            </span>
            {instance.statusText ? <span className="text-sm text-zinc-500">{instance.statusText}</span> : null}
          </div>

          {/* Details grid */}
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <DetailItem label="Target" value={`${instance.target.label} (${instance.target.type})`} />
            <DetailItem label="Run ID" value={instance.runId} />
            <DetailItem label="Started" value={formatTimestamp(instance.startedAt)} />
            <DetailItem label="Finished" value={formatTimestamp(instance.completedAt)} />
            <DetailItem label="Duration" value={formatDuration(instance)} />
            {instance.progress ? (
              <DetailItem
                label="Progress"
                value={`${Math.round(instance.progress.percent)}%${instance.progress.label ? ` — ${instance.progress.label}` : ""}`}
              />
            ) : null}
          </dl>

          {/* Progress bar */}
          {instance.progress ? (
            <div>
              <BackgroundActionMenuProgressBar
                percent={instance.progress.percent}
                label={instance.progress.label || "Background action progress"}
              />
              {typeof instance.progress.current === "number" && typeof instance.progress.total === "number" ? (
                <div className="mt-1 text-xs text-zinc-500">
                  {instance.progress.current} of {instance.progress.total} items
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Error */}
          {instance.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50">
              <div className="border-b border-red-200 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-red-600">Error</span>
              </div>
              <div className="p-4">
                <div className="text-sm font-medium text-red-800">{instance.error.message}</div>
                {instance.error.stack ? (
                  <pre className="mt-3 max-h-40 overflow-auto rounded bg-red-100 p-3 text-xs text-red-700 leading-relaxed whitespace-pre-wrap">
                    {instance.error.stack}
                  </pre>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Key milestones — only non-progress events */}
          {milestoneEvents.length > 0 ? (
            <div>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Key events</h3>
              <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                {milestoneEvents.map((event) => (
                  <div key={event.id} className="flex items-baseline gap-3 px-3 py-2">
                    <span className={["shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", getMilestoneBadgeClass(event.type)].join(" ")}>
                      {event.type}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">{event.message || event.type}</span>
                    <time className="shrink-0 text-xs text-zinc-400">{formatTime(event.createdAt)}</time>
                  </div>
                ))}
              </div>
              {instance.events.length > milestoneEvents.length ? (
                <p className="mt-1.5 text-xs text-zinc-400">
                  {instance.events.length - milestoneEvents.length} additional progress events not shown.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {/* Logs tab — terminal style */}
      {activeTab === "logs" && (
        <div className="p-5">
          {logCount === 0 ? (
            <div className="rounded-lg border border-zinc-200 p-6 text-center text-sm text-zinc-400">
              No logs recorded.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg bg-zinc-950 shadow-inner">
              {/* Terminal toolbar */}
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-[10px] text-zinc-500 font-mono">
                  {logCount} {logCount === 1 ? "entry" : "entries"}
                </span>
              </div>
              {/* Log lines */}
              <div className="max-h-[50vh] overflow-y-auto p-1 font-mono text-xs">
                {instance.logs.map((log) => {
                  const levelCfg = getLogLevelConfig(log.level);
                  return (
                    <div
                      key={log.id}
                      className="group flex gap-0 hover:bg-white/5 rounded px-2 py-1 leading-relaxed"
                    >
                      {/* Timestamp */}
                      <time className="w-20 shrink-0 text-zinc-600 select-none pr-2">{formatTime(log.createdAt)}</time>
                      {/* Level badge */}
                      <span className={["w-10 shrink-0 select-none font-bold pr-2", levelCfg.className].join(" ")}>
                        {levelCfg.label}
                      </span>
                      {/* Message + optional data */}
                      <span className="min-w-0 flex-1 text-zinc-200 break-words">
                        {log.message}
                        {typeof log.data !== "undefined" ? (
                          <span className="block mt-0.5 text-zinc-500 whitespace-pre-wrap">{formatJson(log.data)}</span>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
                {/* Anchor for auto-scroll */}
                <div ref={logEndRef} />
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export function BackgroundActionsMenu() {
  const store = useBackgroundActionsStoreApi();
  const groups = useAvailableBackgroundActions();
  const [detailsInstanceKey, setDetailsInstanceKey] = useState<string | null>(null);
  const actionCount = groups.reduce((total, group) => total + group.actions.length, 0);
  const runningCount = groups.reduce(
    (total, group) => total + group.actions.filter((action) => isBusy(action.instance)).length,
    0,
  );
  const errorCount = groups.reduce(
    (total, group) => total + group.actions.filter((action) => action.instance?.status === "error").length,
    0,
  );
  const { isOpen, buttonProps, itemProps, setIsOpen } = useDropdownMenu(actionCount);

  if (!actionCount) {
    return null;
  }

  const selectedAction = detailsInstanceKey
    ? groups.flatMap((group) => group.actions).find((action) => action.instanceKey === detailsInstanceKey)
    : undefined;
  let itemIndex = 0;

  return (
    <BackgroundActionMenuRoot>
      <BackgroundActionMenuButton active={isOpen} runningCount={runningCount} errorCount={errorCount} aria-label="Actions menu" {...buttonProps} />
      <BackgroundActionMenuPanel open={isOpen} role="menu">
        <div className="py-1.5">
        {groups.map((group, groupIndex) => (
          <Fragment key={group.id}>
            {groupIndex ? <BackgroundActionMenuDivider /> : null}
            <BackgroundActionMenuSection>{group.label}</BackgroundActionMenuSection>
            {group.actions.map((action) => {
              const currentItemProps = itemProps[itemIndex++] || {};
              const { onKeyDown, ...menuItemProps } = currentItemProps as any;
              const statusLabel = getActionStatusLabel(action.instance);
              const busy = isBusy(action.instance);
              const runAction = () => {
                if (!busy) {
                  runBackgroundAction({ store, context: action.context });
                  setIsOpen(true);
                }
              };
              const cancelAction = () => {
                if (busy) {
                  store.getState().cancelAction(action.instanceKey);
                  setIsOpen(true);
                }
              };

              return (
                <BackgroundActionMenuItem key={action.instanceKey} status={action.instance?.status || "idle"}>
                  <BackgroundActionMenuActionButton
                    running={busy}
                    aria-label={busy ? `Cancel ${action.definition.label}` : `Run ${action.definition.label}`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (busy) {
                        cancelAction();
                      } else {
                        runAction();
                      }
                    }}
                  />
                  <BackgroundActionMenuTrigger
                    disabled={busy}
                    {...menuItemProps}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      runAction();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        runAction();
                      } else {
                        onKeyDown?.(event);
                      }
                    }}
                  >
                    <BackgroundActionMenuStatusDot status={action.instance?.status || "idle"} />
                    <BackgroundActionMenuText>
                      <BackgroundActionMenuLabel>
                        {action.instance?.label || action.definition.label}
                      </BackgroundActionMenuLabel>
                      {statusLabel ? (
                        <BackgroundActionMenuMeta variant={action.instance?.status === "error" ? "error" : "default"}>
                          {statusLabel}
                        </BackgroundActionMenuMeta>
                      ) : null}
                      {action.definition.summary && !statusLabel ? (
                        <BackgroundActionMenuMeta className="text-slate-400">
                          {action.definition.summary}
                        </BackgroundActionMenuMeta>
                      ) : null}
                      {busy && action.instance?.progress ? (
                        <BackgroundActionMenuProgressBar
                          percent={action.instance.progress.percent}
                          label={action.instance.progress.label || statusLabel || action.definition.label}
                        />
                      ) : null}
                    </BackgroundActionMenuText>
                  </BackgroundActionMenuTrigger>
                  {action.instance ? (
                    <BackgroundActionMenuInfoButton
                      aria-label={`View ${action.definition.label} details`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDetailsInstanceKey(action.instanceKey);
                        setIsOpen(true);
                      }}
                    />
                  ) : null}
                  {action.instance?.resultsAvailable && action.definition.onResults ? (
                    <BackgroundActionMenuInlineAction
                      onClick={(event) => {
                        event.stopPropagation();
                        action.definition.onResults?.(action.context);
                      }}
                    >
                      Results
                    </BackgroundActionMenuInlineAction>
                  ) : null}
                </BackgroundActionMenuItem>
              );
            })}
          </Fragment>
        ))}
        </div>
      </BackgroundActionMenuPanel>
      {selectedAction?.instance ? (
        <BackgroundActionDetailsModal
          definition={selectedAction.definition}
          instance={selectedAction.instance}
          onClose={() => setDetailsInstanceKey(null)}
        />
      ) : null}
    </BackgroundActionMenuRoot>
  );
}

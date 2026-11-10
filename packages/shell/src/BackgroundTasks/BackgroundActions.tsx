import { backgroundActionLabel, backgroundActionStatus } from "./BackgroundActionMessages";
import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
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
  BackgroundActionMenuText,
  BackgroundActionMenuTrigger,
  Modal,
} from "@manifest-editor/components";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import useDropdownMenu from "../use-dropdown-menu";
import { useVault } from "react-iiif-vault";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { useConfig } from "../ConfigContext/ConfigContext";
import { useEditingResource, useEditingResourceStack } from "../EditingStack/EditingStack";
import { useLayoutActions, useLayoutState } from "../Layout/Layout.context";
import { createManifestEditorCanvasProgressApi } from "../CanvasProgress";
import { usePluginRuntimeApi } from "../PluginContext/PluginContext";
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
    labelMessage: {
      namespace: "editor-api",
      key: `resources.${resource.type.charAt(0).toLowerCase()}${resource.type.slice(1)}`,
      defaultValue: resource.type,
    },
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
    labelMessage: { namespace: "shell", key: "background.currentCanvas" },
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

/** Keeps a running action bound to this editor even when its runtime resources are replaced. */
export function useBackgroundActionFormatter(): NonNullable<BackgroundActionSystemContext["i18n"]> {
  const { resolveMessage, translate } = useEditorI18n();
  const current = useRef({ resolveMessage, translate });
  current.current = { resolveMessage, translate };
  return useMemo(
    () => ({
      resolveMessage: (reference, fallback) => current.current.resolveMessage(reference, fallback),
      translate:
        (namespace) =>
        (...args) =>
          current.current.translate(namespace)(...args),
    }),
    []
  );
}

function useBackgroundActionSystemContext(): BackgroundActionSystemContext {
  const i18n = useBackgroundActionFormatter();
  const rootResource = useAppResource();
  const currentCanvas = useCurrentCanvasTarget();
  const vault = useVault();
  const tags = useMemo(() => createManifestEditorTagsApi(vault), [vault]);
  const canvasProgress = useMemo(() => createManifestEditorCanvasProgressApi(vault), [vault]);
  const plugins = usePluginRuntimeApi();
  const config = useConfig();
  const layoutState = useLayoutState();
  const layoutActions = useLayoutActions();

  return useMemo(
    () => ({
      i18n,
      rootResource,
      currentCanvas,
      vault,
      tags,
      canvasProgress,
      plugins,
      config,
      layoutState,
      layoutActions,
    }),
    [i18n, rootResource, currentCanvas, vault, tags, canvasProgress, plugins, config, layoutState, layoutActions]
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
  const store = useBackgroundActionsStoreApi();
  const definitions = useBackgroundActionsStore((state) => state.definitions);
  const instances = useBackgroundActionsStore((state) => state.instances);
  const plans = useBackgroundActionsStore((state) => state.plans);
  const controllers = useBackgroundActionsStore((state) => state.controllers);
  const hasHydrated = useBackgroundActionsStore((state) => state.hasHydrated);
  const systemContext = useBackgroundActionSystemContext();
  const resumedRuns = useRef(new Set<string>());

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]));

    for (const [instanceKey, instance] of Object.entries(instances)) {
      const definition = definitionsById.get(instance.actionId);
      const runKey = `${instanceKey}:${instance.runId}`;

      if (!definition?.resumable || !isBusy(instance) || !plans[instanceKey] || controllers[instanceKey]) {
        continue;
      }

      if (resumedRuns.current.has(runKey)) {
        continue;
      }

      resumedRuns.current.add(runKey);
      void runBackgroundAction({
        store,
        resume: true,
        context: {
          ...systemContext,
          definition,
          target: instance.target,
          instanceKey,
          instance,
        },
      });
    }
  }, [controllers, definitions, hasHydrated, instances, plans, store, systemContext]);

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

function BackgroundToastText({
  definition,
  instance,
  part,
}: {
  definition: BackgroundActionDefinition;
  instance: BackgroundActionInstance;
  part: "title" | "description" | "action";
}) {
  const i18n = useEditorI18n();
  const content = getBackgroundActionToastContent(definition, instance, () => {}, i18n);
  return <>{part === "action" ? content?.action?.label : content?.[part]}</>;
}

export function BackgroundActionToasts() {
  const definitions = useBackgroundActionsStore((state) => state.definitions);
  const instances = useBackgroundActionsStore((state) => state.instances);
  const systemContext = useBackgroundActionSystemContext();
  const toasts = useToasts();
  const shownToastKeys = useRef(new Set<string>());

  const definitionsById = useMemo(
    () => new Map(definitions.map((definition) => [definition.id, definition])),
    [definitions]
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
        systemContext.i18n
      );

      if (content) {
        toasts.add({
          ...content,
          title: <BackgroundToastText definition={definition} instance={instance} part="title" />,
          description: content.description ? (
            <BackgroundToastText definition={definition} instance={instance} part="description" />
          ) : undefined,
          action: content.action
            ? {
                ...content.action,
                label: <BackgroundToastText definition={definition} instance={instance} part="action" />,
              }
            : undefined,
        });
        shownToastKeys.current.add(dedupKey);
      }
    }
  }, [definitionsById, instances, systemContext, toasts]);

  return null;
}

function isBusy(instance: BackgroundActionInstance | undefined) {
  return instance?.status === "preparing" || instance?.status === "running";
}

function formatTimestamp(value: number | undefined, locale: string, timeZone: string, notRecorded: string) {
  return value && Number.isFinite(value)
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "medium", timeZone }).format(value)
    : notRecorded;
}
function formatTime(value: number | undefined, locale: string, timeZone: string) {
  return value && Number.isFinite(value)
    ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone }).format(value)
    : "--:--:--";
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
  return (
    logLevelConfig[level?.toLowerCase()] ?? {
      label: level?.toUpperCase().slice(0, 3) ?? "LOG",
      className: "text-zinc-300",
    }
  );
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
  const i18n = useEditorI18n();
  const { resolveMessage, locale } = i18n;
  const timeZone = useConfig().uiI18n?.timeZone || "UTC";
  const t = useTranslations("shell");

  const [activeTab, setActiveTab] = useState<DetailsTab>("overview");
  const logEndRef = useRef<HTMLDivElement>(null);
  const logCount = instance.logs.length;
  const progressLabel = resolveMessage(instance.progress?.labelMessage, instance.progress?.label);
  const progressPercent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(
    (instance.progress?.percent || 0) / 100
  );

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

  const milestoneEvents = instance.events.filter((e) => isMilestoneEvent(e.type));

  const tabs: Array<{ id: DetailsTab; label: string; count?: number }> = [
    { id: "overview", label: t("background.overview") },
    { id: "logs", label: t("background.logs"), count: logCount },
  ];

  return (
    <Modal title={backgroundActionLabel(definition, instance, i18n)} onClose={onClose} className="max-w-3xl">
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
              {t(`background.${instance.status}`)}
            </span>
            {instance.statusText ? (
              <span className="text-sm text-zinc-500">
                {resolveMessage(instance.statusTextMessage, instance.statusText)}
              </span>
            ) : null}
          </div>

          <p className="text-xs text-zinc-500">{t("background.timeZone", { timeZone })}</p>
          {/* Details grid */}
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <DetailItem
              label={t("background.target")}
              value={resolveMessage(instance.target.labelMessage, instance.target.label)}
            />
            <DetailItem label={t("background.runId")} value={instance.runId} />
            <DetailItem
              label={t("background.started")}
              value={formatTimestamp(instance.startedAt, locale, timeZone, t("background.notRecorded"))}
            />
            <DetailItem
              label={t("background.finished")}
              value={formatTimestamp(instance.completedAt, locale, timeZone, t("background.notRecorded"))}
            />
            <DetailItem
              label={t("background.duration")}
              value={
                instance.startedAt
                  ? t("background.seconds", {
                      count: Math.max(
                        0,
                        Math.round(((instance.completedAt || Date.now()) - instance.startedAt) / 1000)
                      ),
                    })
                  : t("background.notRecorded")
              }
            />
            {instance.progress ? (
              <DetailItem
                label={t("background.progressLabel")}
                value={
                  progressLabel
                    ? t("background.progressValue", { percent: progressPercent, label: progressLabel })
                    : progressPercent
                }
              />
            ) : null}
          </dl>

          {/* Progress bar */}
          {instance.progress ? (
            <div>
              <BackgroundActionMenuProgressBar
                percent={instance.progress.percent}
                label={
                  resolveMessage(instance.progress.labelMessage, instance.progress.label) ||
                  t("background.progressAccessible")
                }
              />
              {typeof instance.progress.current === "number" && typeof instance.progress.total === "number" ? (
                <div className="mt-1 text-xs text-zinc-500">
                  {t("background.items", { current: instance.progress.current, count: instance.progress.total })}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Error */}
          {instance.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50">
              <div className="border-b border-red-200 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
                  {t("background.error")}
                </span>
              </div>
              <div className="p-4">
                <div className="text-sm font-medium text-red-800">
                  {resolveMessage(instance.error.messageReference, instance.error.message)}
                </div>
                {instance.error.stack ? (
                  <pre className="mt-3 max-h-40 overflow-auto rounded bg-red-100 p-3 text-xs text-red-700 leading-relaxed whitespace-pre-wrap">
                    {instance.error.stack}
                  </pre>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Key milestones */}
          {milestoneEvents.length > 0 ? (
            <div>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {t("background.events")}
              </h3>
              <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                {milestoneEvents.map((event) => (
                  <div key={event.id} className="flex items-baseline gap-3 px-3 py-2">
                    <span
                      className={[
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        getMilestoneBadgeClass(event.type),
                      ].join(" ")}
                    >
                      {t(`events.${event.type}`, undefined, { defaultValue: event.type })}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">
                      {resolveMessage(event.messageReference, event.message) ||
                        t(`events.${t(`events.${event.type}`, undefined, { defaultValue: event.type })}`, undefined, {
                          defaultValue: event.type,
                        })}
                    </span>
                    <time className="shrink-0 text-xs text-zinc-400">
                      {formatTime(event.createdAt, locale, timeZone)}
                    </time>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Logs tab — terminal style */}
      {activeTab === "logs" && (
        <div className="p-5">
          {logCount === 0 ? (
            <div className="rounded-lg border border-zinc-200 p-6 text-center text-sm text-zinc-400">
              {t("background.noLogs")}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg bg-zinc-950 shadow-inner">
              {/* Terminal toolbar */}
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-[10px] text-zinc-500 font-mono">
                  {t("background.entries", { count: logCount })}
                </span>
              </div>
              {/* Log lines */}
              <div className="max-h-[50vh] overflow-y-auto p-1 font-mono text-xs">
                {instance.logs.map((log) => {
                  const levelCfg = getLogLevelConfig(log.level);
                  return (
                    <div key={log.id} className="group flex gap-0 hover:bg-white/5 rounded px-2 py-1 leading-relaxed">
                      {/* Timestamp */}
                      <time className="w-20 shrink-0 text-zinc-600 select-none pr-2">
                        {formatTime(log.createdAt, locale, timeZone)}
                      </time>
                      {/* Level badge */}
                      <span className={["w-10 shrink-0 select-none font-bold pr-2", levelCfg.className].join(" ")}>
                        {t(`logLevels.${log.level}`, undefined, { defaultValue: levelCfg.label })}
                      </span>
                      {/* Message + optional data */}
                      <span className="min-w-0 flex-1 text-zinc-200 break-words">
                        {resolveMessage(log.messageReference, log.message)}
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
  const i18n = useEditorI18n();
  const { resolveMessage } = i18n;
  const t = useTranslations("shell");

  const store = useBackgroundActionsStoreApi();
  const groups = useAvailableBackgroundActions();
  const [detailsInstanceKey, setDetailsInstanceKey] = useState<string | null>(null);
  const actionCount = groups.reduce((total, group) => total + group.actions.length, 0);
  const runningCount = groups.reduce(
    (total, group) => total + group.actions.filter((action) => isBusy(action.instance)).length,
    0
  );
  const errorCount = groups.reduce(
    (total, group) => total + group.actions.filter((action) => action.instance?.status === "error").length,
    0
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
      <BackgroundActionMenuButton
        active={isOpen}
        runningCount={runningCount}
        errorCount={errorCount}
        aria-label={t("background.menu")}
        {...buttonProps}
      />
      <BackgroundActionMenuPanel open={isOpen} role="menu" aria-hidden={!isOpen} inert={!isOpen}>
        <div className="py-1.5">
          {groups.map((group, groupIndex) => (
            <Fragment key={group.id}>
              {groupIndex ? <BackgroundActionMenuDivider /> : null}
              <BackgroundActionMenuSection>
                {resolveMessage(group.target.labelMessage, group.label)}
              </BackgroundActionMenuSection>
              {group.actions.map((action) => {
                const currentItemProps = itemProps[itemIndex++] || {};
                const { onKeyDown, ...menuItemProps } = currentItemProps as any;
                const statusLabel = backgroundActionStatus(action.instance, i18n);
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
                    <BackgroundActionMenuTrigger
                      running={busy}
                      {...menuItemProps}
                      aria-label={t(busy ? "background.cancelAction" : "background.runAction", {
                        name: resolveMessage(action.definition.labelMessage, action.definition.label),
                      })}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (busy) {
                          cancelAction();
                        } else {
                          runAction();
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          if (busy) {
                            cancelAction();
                          } else {
                            runAction();
                          }
                        } else {
                          onKeyDown?.(event);
                        }
                      }}
                    >
                      <BackgroundActionMenuText>
                        <BackgroundActionMenuLabel running={busy}>
                          {backgroundActionLabel(action.definition, action.instance, i18n)}
                        </BackgroundActionMenuLabel>
                        {statusLabel ? (
                          <BackgroundActionMenuMeta variant={action.instance?.status === "error" ? "error" : "default"}>
                            {statusLabel}
                          </BackgroundActionMenuMeta>
                        ) : null}
                        {resolveMessage(action.definition.summaryMessage, action.definition.summary) && !statusLabel ? (
                          <BackgroundActionMenuMeta>
                            {resolveMessage(action.definition.summaryMessage, action.definition.summary)}
                          </BackgroundActionMenuMeta>
                        ) : null}
                        {busy && action.instance?.progress ? (
                          <BackgroundActionMenuProgressBar
                            percent={action.instance.progress.percent}
                            label={
                              resolveMessage(action.instance.progress.labelMessage, action.instance.progress.label) ||
                              statusLabel ||
                              resolveMessage(action.definition.labelMessage, action.definition.label)
                            }
                          />
                        ) : null}
                      </BackgroundActionMenuText>
                    </BackgroundActionMenuTrigger>
                    {action.instance?.resultsAvailable && action.definition.onResults ? (
                      <BackgroundActionMenuInlineAction
                        onClick={(event) => {
                          event.stopPropagation();
                          action.definition.onResults?.(action.context);
                        }}
                      >
                        {t("background.results")}
                      </BackgroundActionMenuInlineAction>
                    ) : null}
                    {action.instance ? (
                      <BackgroundActionMenuInfoButton
                        aria-label={t("background.viewDetails", {
                          name: resolveMessage(action.definition.labelMessage, action.definition.label),
                        })}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setDetailsInstanceKey(action.instanceKey);
                          setIsOpen(true);
                        }}
                      />
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

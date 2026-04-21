import {
  BackgroundActionMenuButton,
  BackgroundActionMenuActionButton,
  BackgroundActionMenuDivider,
  BackgroundActionMenuInlineAction,
  BackgroundActionMenuItem,
  BackgroundActionMenuLabel,
  BackgroundActionMenuMeta,
  BackgroundActionMenuPanel,
  BackgroundActionMenuRoot,
  BackgroundActionMenuSection,
  BackgroundActionMenuText,
  BackgroundActionMenuTrigger,
} from "@manifest-editor/components";
import { Fragment, useEffect, useMemo, useRef } from "react";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import { useVault } from "react-iiif-vault";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { useConfig } from "../ConfigContext/ConfigContext";
import { useEditingResource, useEditingResourceStack } from "../EditingStack/EditingStack";
import { useLayoutActions, useLayoutState } from "../Layout/Layout.context";
import { useToasts } from "../Toast/ToastContext";
import { getBackgroundActionToastContent, getBackgroundActionToastDedupKey } from "./BackgroundActionToasts.helpers";
import {
  getAvailableBackgroundActionGroups,
  runBackgroundAction,
  useBackgroundActionsStore,
  useBackgroundActionsStoreApi,
} from "./BackgroundTasksStore";
import type {
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
  const config = useConfig();
  const layoutState = useLayoutState();
  const layoutActions = useLayoutActions();

  return useMemo(
    () => ({
      rootResource,
      currentCanvas,
      vault,
      config,
      layoutState,
      layoutActions,
    }),
    [rootResource, currentCanvas, vault, config, layoutState, layoutActions],
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

  return instance.statusText || instance.status;
}

export function BackgroundActionsMenu() {
  const store = useBackgroundActionsStoreApi();
  const groups = useAvailableBackgroundActions();
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

  let itemIndex = 0;

  return (
    <BackgroundActionMenuRoot>
      <BackgroundActionMenuButton active={isOpen} runningCount={runningCount} errorCount={errorCount} aria-label="Actions menu" {...buttonProps} />
      <BackgroundActionMenuPanel open={isOpen} role="menu">
        {groups.map((group, groupIndex) => (
          <Fragment key={group.id}>
            {groupIndex ? <BackgroundActionMenuDivider /> : null}
            <BackgroundActionMenuSection>{group.label}</BackgroundActionMenuSection>
            {group.actions.map((action) => {
              const currentItemProps = itemProps[itemIndex++] || {};
              const { onKeyDown, ...menuItemProps } = currentItemProps as any;
              const statusLabel = getActionStatusLabel(action.instance);
              const disabled = isBusy(action.instance);
              const runAction = () => {
                if (!disabled) {
                  runBackgroundAction({ store, context: action.context });
                  setIsOpen(true);
                }
              };

              return (
                <BackgroundActionMenuItem key={action.instanceKey} status={action.instance?.status || "idle"}>
                  <BackgroundActionMenuActionButton
                    running={disabled}
                    disabled={disabled}
                    aria-label={disabled ? `${action.definition.label} is running` : `Run ${action.definition.label}`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      runAction();
                    }}
                  />
                  <BackgroundActionMenuTrigger
                    disabled={disabled}
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
                    </BackgroundActionMenuText>
                  </BackgroundActionMenuTrigger>
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
      </BackgroundActionMenuPanel>
    </BackgroundActionMenuRoot>
  );
}

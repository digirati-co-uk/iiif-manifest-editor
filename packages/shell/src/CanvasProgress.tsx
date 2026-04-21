import type { Vault } from "@iiif/helpers/vault";
import { useMemo } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";

export const CANVAS_PROGRESS_META_NAMESPACE = "@manifest-editor/canvas-progress";
export const CANVAS_PROGRESS_STATUS_META_KEY = "status";

export type CanvasProgressActiveStatus = "queued" | "pending" | "done";
export type CanvasProgressStatus = CanvasProgressActiveStatus | "none";
export type CanvasProgressStatusInput = CanvasProgressStatus | null | undefined;

export type CanvasProgressResource =
  | string
  | {
      id: string;
      type?: string;
    }
  | null
  | undefined;

const ACTIVE_STATUSES = new Set<CanvasProgressActiveStatus>(["queued", "pending", "done"]);

function getResourceId(resource: CanvasProgressResource) {
  return typeof resource === "string" ? resource : resource?.id || null;
}

function normaliseCanvasProgressStatus(status: unknown): CanvasProgressStatus {
  return typeof status === "string" && ACTIVE_STATUSES.has(status as CanvasProgressActiveStatus)
    ? (status as CanvasProgressActiveStatus)
    : "none";
}

function isActiveCanvasProgressStatus(status: CanvasProgressStatusInput): status is CanvasProgressActiveStatus {
  return typeof status === "string" && ACTIVE_STATUSES.has(status as CanvasProgressActiveStatus);
}

export function getCanvasProgressStatus(vault: Vault, resource: CanvasProgressResource): CanvasProgressStatus {
  const id = getResourceId(resource);
  if (!id) {
    return "none";
  }

  const meta = vault.getResourceMeta(id, CANVAS_PROGRESS_META_NAMESPACE) as
    | { [CANVAS_PROGRESS_STATUS_META_KEY]?: CanvasProgressStatus }
    | undefined;

  return normaliseCanvasProgressStatus(meta?.[CANVAS_PROGRESS_STATUS_META_KEY]);
}

export function getCanvasProgressStatusFromState(state: any, resource: CanvasProgressResource): CanvasProgressStatus {
  const id = getResourceId(resource);
  if (!id) {
    return "none";
  }

  return normaliseCanvasProgressStatus(
    state?.iiif?.meta?.[id]?.[CANVAS_PROGRESS_META_NAMESPACE]?.[CANVAS_PROGRESS_STATUS_META_KEY],
  );
}

export function setCanvasProgressStatus(
  vault: Vault,
  resource: CanvasProgressResource,
  status: CanvasProgressStatusInput,
): CanvasProgressStatus {
  const id = getResourceId(resource);
  if (!id) {
    return "none";
  }

  const nextStatus = isActiveCanvasProgressStatus(status) ? status : undefined;
  vault.setMetaValue([id, CANVAS_PROGRESS_META_NAMESPACE, CANVAS_PROGRESS_STATUS_META_KEY], nextStatus);
  return nextStatus || "none";
}

export function clearCanvasProgressStatus(vault: Vault, resource: CanvasProgressResource): CanvasProgressStatus {
  return setCanvasProgressStatus(vault, resource, "none");
}

export function setCanvasProgressStatuses(
  vault: Vault,
  resources: CanvasProgressResource[],
  status: CanvasProgressStatusInput,
): Record<string, CanvasProgressStatus> {
  const statuses: Record<string, CanvasProgressStatus> = {};

  for (const resource of resources) {
    const id = getResourceId(resource);
    if (!id) {
      continue;
    }

    statuses[id] = setCanvasProgressStatus(vault, resource, status);
  }

  return statuses;
}

export function clearCanvasProgressStatuses(
  vault: Vault,
  resources: CanvasProgressResource[],
): Record<string, CanvasProgressStatus> {
  return setCanvasProgressStatuses(vault, resources, "none");
}

export interface ManifestEditorCanvasProgressApi {
  getStatus(resource: CanvasProgressResource): CanvasProgressStatus;
  setStatus(resource: CanvasProgressResource, status: CanvasProgressStatusInput): CanvasProgressStatus;
  clearStatus(resource: CanvasProgressResource): CanvasProgressStatus;
  setStatuses(resources: CanvasProgressResource[], status: CanvasProgressStatusInput): Record<string, CanvasProgressStatus>;
  clearStatuses(resources: CanvasProgressResource[]): Record<string, CanvasProgressStatus>;
}

export function createManifestEditorCanvasProgressApi(vault: Vault): ManifestEditorCanvasProgressApi {
  return {
    getStatus(resource) {
      return getCanvasProgressStatus(vault, resource);
    },
    setStatus(resource, status) {
      return setCanvasProgressStatus(vault, resource, status);
    },
    clearStatus(resource) {
      return clearCanvasProgressStatus(vault, resource);
    },
    setStatuses(resources, status) {
      return setCanvasProgressStatuses(vault, resources, status);
    },
    clearStatuses(resources) {
      return clearCanvasProgressStatuses(vault, resources);
    },
  };
}

export function createTrackingCanvasProgressApi(
  baseApi: ManifestEditorCanvasProgressApi,
  trackedResourceIds = new Set<string>(),
): ManifestEditorCanvasProgressApi & { clearTrackedStatuses(): void; trackedResourceIds: Set<string> } {
  function track(resource: CanvasProgressResource) {
    const id = getResourceId(resource);
    if (id) {
      trackedResourceIds.add(id);
    }
  }

  function trackMany(resources: CanvasProgressResource[]) {
    for (const resource of resources) {
      track(resource);
    }
  }

  return {
    trackedResourceIds,
    getStatus(resource) {
      return baseApi.getStatus(resource);
    },
    setStatus(resource, status) {
      track(resource);
      return baseApi.setStatus(resource, status);
    },
    clearStatus(resource) {
      track(resource);
      return baseApi.clearStatus(resource);
    },
    setStatuses(resources, status) {
      trackMany(resources);
      return baseApi.setStatuses(resources, status);
    },
    clearStatuses(resources) {
      trackMany(resources);
      return baseApi.clearStatuses(resources);
    },
    clearTrackedStatuses() {
      baseApi.clearStatuses(Array.from(trackedResourceIds).map((id) => ({ id, type: "Canvas" })));
      trackedResourceIds.clear();
    },
  };
}

export function useCanvasProgressStatus(resource: CanvasProgressResource): CanvasProgressStatus {
  const resourceId = getResourceId(resource);

  return useVaultSelector((state) => {
    if (!resourceId) {
      return "none";
    }
    return getCanvasProgressStatusFromState(state, resourceId);
  }, [resourceId]);
}

export function useCanvasProgressActions(resource: CanvasProgressResource) {
  const vault = useVault();
  const resourceId = getResourceId(resource);
  const progressActions = useMemo(() => createManifestEditorCanvasProgressApi(vault), [vault]);

  return useMemo(
    () => ({
      setStatus(status: CanvasProgressStatusInput) {
        return progressActions.setStatus(resourceId, status);
      },
      clearStatus() {
        return progressActions.clearStatus(resourceId);
      },
      getStatus() {
        return progressActions.getStatus(resourceId);
      },
    }),
    [progressActions, resourceId],
  );
}

const statusConfig: Record<
  CanvasProgressActiveStatus,
  { label: string; stripClass: string; badgeClass: string; dimOverlay?: boolean }
> = {
  queued: {
    label: "Queued",
    stripClass: "bg-zinc-400/80",
    badgeClass: "bg-zinc-500",
    dimOverlay: true,
  },
  pending: {
    label: "In progress",
    stripClass: "bg-amber-400/90 animate-pulse",
    badgeClass: "bg-amber-500",
  },
  done: {
    label: "Done",
    stripClass: "bg-me-primary-500",
    badgeClass: "bg-me-primary-500",
  },
};

function QueuedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l2.5 2.5" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.3" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l4 4 8-8" />
    </svg>
  );
}

export function ManifestEditorCanvasProgressOverlay({
  resource,
  status,
  className,
}: {
  resource?: CanvasProgressResource;
  status?: CanvasProgressStatus;
  className?: string;
}) {
  if (status) {
    return <ManifestEditorCanvasProgressOverlayContent status={status} className={className} />;
  }

  return <ManifestEditorResourceCanvasProgressOverlay resource={resource} className={className} />;
}

function ManifestEditorResourceCanvasProgressOverlay({
  resource,
  className,
}: {
  resource?: CanvasProgressResource;
  className?: string;
}) {
  const status = useCanvasProgressStatus(resource);

  return <ManifestEditorCanvasProgressOverlayContent status={status} className={className} />;
}

function ManifestEditorCanvasProgressOverlayContent({
  status,
  className,
}: {
  status: CanvasProgressStatus;
  className?: string;
}) {
  if (status === "none") {
    return null;
  }

  const config = statusConfig[status];

  return (
    <>
      {/* Dim overlay for queued — signals "waiting, not yet active" */}
      {config.dimOverlay && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-white/40" />
      )}
      {/* Full-width coloured strip at top edge */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] rounded-t-sm ${config.stripClass} ${className || ""}`}
      />
      {/* Icon badge — top-right corner, doesn't conflict with tag overlay (top-left) */}
      <div
        className={`pointer-events-none absolute right-1.5 top-1.5 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full ${config.badgeClass} shadow-md ring-2 ring-white/70`}
        title={config.label}
      >
        <span className="sr-only">{config.label}</span>
        {status === "queued" && <QueuedIcon className="h-2.5 w-2.5 text-white" />}
        {status === "pending" && <SpinnerIcon className="h-2.5 w-2.5 animate-spin text-white" />}
        {status === "done" && <CheckIcon className="h-2.5 w-2.5 text-white" />}
      </div>
    </>
  );
}

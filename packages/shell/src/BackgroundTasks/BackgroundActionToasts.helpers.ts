import type { ToastContent } from "../Toast/ToastContext";
import type { BackgroundActionDefinition, BackgroundActionInstance } from "./BackgroundTasks.types";

export function getBackgroundActionToastDedupKey(instance: BackgroundActionInstance) {
  if ((instance.status !== "complete" && instance.status !== "error") || !instance.completedAt) {
    return null;
  }

  return `${instance.id}:${instance.status}:${instance.completedAt}`;
}

export function getBackgroundActionToastContent(
  definition: BackgroundActionDefinition,
  instance: BackgroundActionInstance,
  onResults?: () => void,
): ToastContent | null {
  const label = instance.label || definition.label;

  if (instance.status === "complete") {
    return {
      variant: "success",
      title: `${label} complete`,
      description: instance.resultsAvailable ? "Results are ready." : undefined,
      action:
        instance.resultsAvailable && onResults
          ? {
              label: "Results",
              onPress: onResults,
            }
          : undefined,
    };
  }

  if (instance.status === "error") {
    return {
      variant: "error",
      title: `${label} failed`,
      description: instance.error?.message || instance.statusText || "Action failed",
    };
  }

  return null;
}

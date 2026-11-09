import type { EditorI18n } from "@manifest-editor/i18n/core";
import { backgroundActionFormatter, backgroundActionLabel, backgroundActionStatus } from "./BackgroundActionMessages";
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
  formatter?: Pick<EditorI18n, "resolveMessage" | "translate">
): ToastContent | null {
  const i18n = backgroundActionFormatter(formatter);
  const t = i18n.translate("shell");
  const label = backgroundActionLabel(definition, instance, i18n);

  if (instance.status === "complete") {
    return {
      variant: "success",
      title: t("background.toastComplete", { name: label }),
      description: instance.resultsAvailable ? t("background.resultsReady") : undefined,
      action:
        instance.resultsAvailable && onResults
          ? {
              label: t("background.results"),
              onPress: onResults,
            }
          : undefined,
    };
  }

  if (instance.status === "error") {
    return {
      variant: "error",
      title: t("background.toastFailed", { name: label }),
      description: backgroundActionStatus(instance, i18n) || t("background.failed"),
    };
  }

  return null;
}

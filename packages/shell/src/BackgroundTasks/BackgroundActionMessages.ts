import { createEditorI18n, type EditorI18n, type MessageReference } from "@manifest-editor/i18n/core";
import type { BackgroundActionDefinition, BackgroundActionInstance } from "./BackgroundTasks.types";

type Formatter = Pick<EditorI18n, "resolveMessage" | "translate">;
/** Pure fallback for task/Node consumers; React supplies its editor-bound formatter. */
export function backgroundActionFormatter(i18n?: Formatter): Formatter {
  return i18n || createEditorI18n();
}
export function backgroundActionLabel(
  definition: BackgroundActionDefinition,
  instance: BackgroundActionInstance | undefined,
  i18n: Formatter
) {
  return instance
    ? i18n.resolveMessage(instance.labelMessage, instance.label)
    : i18n.resolveMessage(definition.labelMessage, definition.label);
}
export function backgroundActionStatus(instance: BackgroundActionInstance | undefined, i18n: Formatter): string {
  if (!instance || instance.status === "idle") return "";
  if (instance.status === "error")
    return (
      i18n.resolveMessage(instance.error?.messageReference, instance.error?.message) ||
      i18n.resolveMessage(instance.statusTextMessage, instance.statusText) ||
      i18n.translate("shell")("background.error")
    );
  if (instance.status === "complete" && instance.resultsAvailable) return i18n.translate("shell")("background.ready");
  return (
    i18n.resolveMessage(instance.statusTextMessage, instance.statusText) ||
    i18n.translate("shell")(`background.${instance.status}`)
  );
}
export function shellTaskMessage(key: string, defaultValue: string): MessageReference {
  return { namespace: "shell", key: `background.${key}`, defaultValue };
}

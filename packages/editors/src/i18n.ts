import { useSyncExternalStore } from "react";
import { useEditorsI18nInstance } from "./editor-i18n-context";
import { type MessageReference } from "@manifest-editor/i18n";

/** Display metadata only. Never pass authored IIIF values to this resolver. */
export function useDisplayLabel() {
  const runtime = useEditorsI18nInstance();
  useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const resolveMessage = runtime.resolveMessage;
  return (item: { labelMessage?: MessageReference; label: unknown }): string | undefined =>
    item.labelMessage
      ? resolveMessage(item.labelMessage, typeof item.label === "string" ? item.label : undefined)
      : typeof item.label === "string"
        ? item.label
        : undefined;
}

/** Content tags are independent of the UI locale registry, including imported/invalid tags. */
export function contentLanguageName(tag: string, locale: string, noLanguage: string): string {
  if (tag === "none") return noLanguage;
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(tag) || tag;
  } catch {
    return tag;
  }
}

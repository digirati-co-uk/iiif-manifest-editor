import { useTranslations } from "@manifest-editor/i18n";

/** Subscribes inside UI nodes retained by an annotation request or portal. */
export function EditorMessage({ message, namespace = "editors" }: { message: string; namespace?: string }) {
  const t = useTranslations(namespace);
  return <>{t(message)}</>;
}

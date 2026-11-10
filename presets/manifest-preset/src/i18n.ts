import { createMessageReference, type MessageReference, type MessageValues } from "@manifest-editor/i18n/core";

/** Display metadata only. Never put a translator in IIIF, task or worker payloads. */
export function manifestMessage(key: string, values?: MessageValues): MessageReference {
  return createMessageReference("manifest", key, values ? { values } : undefined);
}

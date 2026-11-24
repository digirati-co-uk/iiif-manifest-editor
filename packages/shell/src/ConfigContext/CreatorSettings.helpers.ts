import { type CreatorDefinition, getCreatorConfigKey } from "@manifest-editor/creator-api";

export function getCreatorSettings(creators: CreatorDefinition[]): CreatorDefinition[] {
  const byConfigKey = new Map<string, CreatorDefinition>();
  for (const creator of creators) {
    if (!creator.configuration?.fields.length) continue;

    const configKey = getCreatorConfigKey(creator);
    if (!byConfigKey.has(configKey) || creator.id === configKey) {
      byConfigKey.set(configKey, creator);
    }
  }
  return Array.from(byConfigKey.values());
}

/** Newline separated textarea value -> trimmed, de-duplicated list. Blank input means "not configured" (undefined). */
export function parseStringListSetting(input: string | null | undefined): string[] | undefined {
  const items: string[] = [];
  for (const line of (input || "").split(/\r?\n/)) {
    const item = line.trim();
    if (item && !items.includes(item)) items.push(item);
  }
  return items.length ? items : undefined;
}

export function formatStringListSetting(value: unknown, fallback?: string[]): string {
  const list = Array.isArray(value) ? value : fallback || [];
  return list.filter((item): item is string => typeof item === "string").join("\n");
}

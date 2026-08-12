import {
  type CreatorDefinition,
  getCreatorConfigKey,
} from "@manifest-editor/creator-api";

export function getCreatorSettings(
  creators: CreatorDefinition[],
): CreatorDefinition[] {
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

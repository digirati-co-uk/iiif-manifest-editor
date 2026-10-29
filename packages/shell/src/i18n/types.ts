import type { EditorI18nOptions, UiI18nConfig, MessageReference } from "@manifest-editor/i18n/core";
/** JSON configuration only. Catalogs/loaders belong in `localisation`. */
export interface ShellUiI18nConfig extends Partial<UiI18nConfig> {
  /** Explicit display timezone; defaults to UTC. Does not alter IIIF navDate. */
  timeZone?: string;
  requiredNamespaces?: readonly string[];
}
export interface ShellDisplayMessages {
  labelMessage?: MessageReference;
  titleMessage?: MessageReference;
  summaryMessage?: MessageReference;
  descriptionMessage?: MessageReference;
  placeholderMessage?: MessageReference;
}
/** Resource layers follow runtime precedence; policies always intersect. */
export type ShellLocalisation = EditorI18nOptions;

export function mergeUiI18n(base?: ShellUiI18nConfig, override?: ShellUiI18nConfig): ShellUiI18nConfig | undefined {
  if (!base && !override) return undefined;
  if (base) validateShellUiI18n(base);
  if (override) validateShellUiI18n(override);
  return {
    ...base,
    ...override,
    requiredNamespaces: [...new Set([...(base?.requiredNamespaces || []), ...(override?.requiredNamespaces || [])])],
  };
}

/** Merge inherited preset resource layers in extension order, without weakening policy. */
export function mergeLocalisation(
  base?: ShellLocalisation,
  override?: ShellLocalisation
): ShellLocalisation | undefined {
  if (!base && !override) return undefined;
  const merge = (a: any, b: any): any => {
    const result = { ...a };
    for (const [key, value] of Object.entries(b || {})) {
      result[key] = value && typeof value === "object" && !Array.isArray(value) ? merge(result[key], value) : value;
    }
    return result;
  };
  return {
    ...base,
    ...override,
    config: { ...base?.config, ...override?.config },
    catalogs: merge(base?.catalogs, override?.catalogs),
    profiles: merge(base?.profiles, override?.profiles),
    presetProfiles: merge(base?.presetProfiles, override?.presetProfiles),
    host: merge(base?.host, override?.host),
    policies: [...(base?.policies || []), ...(override?.policies || [])],
    presets: [...(base?.presets || []), ...(override?.presets || [])],
    registrations: [...(base?.registrations || []), ...(override?.registrations || [])],
    resourceLoaders: [...new Set([...(base?.resourceLoaders || []), ...(override?.resourceLoaders || [])])],
    requiredNamespaces: [...new Set([...(base?.requiredNamespaces || []), ...(override?.requiredNamespaces || [])])],
  };
}

/** Persisted schema intentionally has no callbacks, catalogs, `locale`, or `profile` aliases. */
export const shellUiI18nSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    timeZone: { type: "string", minLength: 1 },
    defaultLocale: { type: "string", minLength: 1 },
    fallbackLocale: { type: "string", minLength: 1 },
    defaultProfile: { type: "string", minLength: 1 },
    availableLocales: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
    availableProfiles: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
    requiredNamespaces: { type: "array", items: { type: "string", minLength: 1 } },
  },
} as const;
export function validateShellUiI18n(value: unknown): asserts value is ShellUiI18nConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("uiI18n must be an object");
  for (const [key, item] of Object.entries(value)) {
    if (!Object.hasOwn(shellUiI18nSchema.properties, key)) throw new TypeError(`Unknown uiI18n field: ${key}`);
    const field = shellUiI18nSchema.properties[key as keyof typeof shellUiI18nSchema.properties];
    if (!field) throw new TypeError(`Unknown uiI18n field: ${key}`);
    if (item === undefined) continue;
    if (key === "timeZone") new Intl.DateTimeFormat("en-GB", { timeZone: item as string });
    if (
      field.type === "string"
        ? typeof item !== "string" || !item.trim()
        : !Array.isArray(item) ||
          (key !== "requiredNamespaces" && !item.length) ||
          item.some((part) => typeof part !== "string" || !part.trim())
    )
      throw new TypeError(`Invalid uiI18n field: ${key}`);
  }
}

import { canonicalLocale } from "./schema.ts";

export interface LocaleDefinition {
  readonly id: string;
  readonly nativeName: string;
  readonly direction: "ltr" | "rtl";
}
export interface UiI18nConfig {
  readonly defaultLocale: string;
  readonly availableLocales: readonly string[];
  readonly fallbackLocale: string;
  readonly defaultProfile: string;
  readonly availableProfiles: readonly string[];
}
export interface PresetLanguagePolicy {
  readonly availableLocales?: readonly string[];
  readonly availableProfiles?: readonly string[];
  readonly defaultLocale?: string;
  readonly defaultProfile?: string;
}
export interface LanguagePreferences {
  readonly locale?: string;
  readonly profile?: string;
  readonly persistedLocale?: string;
  readonly persistedProfile?: string;
  readonly preferredLocales?: readonly string[];
}
export interface UiLanguageSelection {
  readonly locale: string;
  readonly profile: string;
  readonly direction: "ltr" | "rtl";
  readonly localeChain: readonly string[];
  readonly availableLocales: readonly string[];
  readonly availableProfiles: readonly string[];
}

function parents(locale: string): string[] {
  const base = new Intl.Locale(locale).baseName;
  const parts = base.split("-");
  const chain = [locale];
  while (parts.length) {
    chain.push(parts.join("-"));
    parts.pop();
  }
  return [...new Set(chain)];
}

export function buildLocaleChain(
  locale: string,
  fallbackLocale: string,
  registeredLocales: readonly string[]
): readonly string[] {
  const registered = new Set(registeredLocales.map(canonicalLocale));
  return Object.freeze(
    [...new Set([...parents(canonicalLocale(locale)), ...parents(canonicalLocale(fallbackLocale))])].filter((id) =>
      registered.has(id)
    )
  );
}

export function resolveUiSelection(
  config: UiI18nConfig,
  registry: readonly LocaleDefinition[],
  policies: readonly PresetLanguagePolicy[] = [],
  preferences: LanguagePreferences = {}
): UiLanguageSelection {
  const locales = new Map<string, LocaleDefinition>();
  for (const definition of registry) {
    const id = canonicalLocale(definition.id);
    if (id !== definition.id || locales.has(id))
      throw new TypeError(`Duplicate or non-canonical locale: ${definition.id}`);
    if (!definition.nativeName.trim() || !["ltr", "rtl"].includes(definition.direction))
      throw new TypeError(`Invalid locale metadata: ${id}`);
    locales.set(id, definition);
  }
  const canonicalList = (ids: readonly string[]) => [...new Set(ids.map(canonicalLocale))];
  const configuredLocales = canonicalList(config.availableLocales);
  if (configuredLocales.some((id) => !locales.has(id)) || !locales.has(canonicalLocale(config.fallbackLocale)))
    throw new TypeError("Configuration contains an unregistered locale");
  if (!configuredLocales.includes(canonicalLocale(config.defaultLocale)))
    throw new TypeError("Default locale must be selectable before preset restrictions");
  if (
    !config.availableProfiles.length ||
    config.availableProfiles.some((id) => !/^[a-z][a-z0-9-]*$/.test(id)) ||
    !config.availableProfiles.includes(config.defaultProfile)
  )
    throw new TypeError("Default profile must be available and profile IDs must be valid");
  let availableLocales = configuredLocales;
  let availableProfiles = [...new Set(config.availableProfiles)];
  for (const policy of policies) {
    if (policy.availableLocales) {
      const allowed = canonicalList(policy.availableLocales);
      availableLocales = availableLocales.filter((id) => allowed.includes(id));
    }
    if (policy.availableProfiles)
      availableProfiles = availableProfiles.filter((id) => policy.availableProfiles!.includes(id));
  }
  if (!availableLocales.length || !availableProfiles.length)
    throw new TypeError("Host and preset language policies have an empty intersection");
  const match = (candidate?: string) => {
    if (!candidate) return undefined;
    try {
      return parents(canonicalLocale(candidate)).find((id) => availableLocales.includes(id));
    } catch {
      return undefined;
    }
  };
  if (preferences.locale && !match(preferences.locale))
    throw new TypeError(`Controlled locale is unavailable: ${preferences.locale}`);
  if (preferences.profile && !availableProfiles.includes(preferences.profile))
    throw new TypeError(`Controlled profile is unavailable: ${preferences.profile}`);
  const defaults = [...policies].reverse().map((policy) => policy.defaultLocale);
  const locale =
    [
      preferences.locale,
      preferences.persistedLocale,
      ...(preferences.preferredLocales || []),
      ...defaults,
      config.defaultLocale,
    ]
      .map(match)
      .find(Boolean) || availableLocales[0]!;
  const profile =
    [
      preferences.profile,
      preferences.persistedProfile,
      ...[...policies].reverse().map((policy) => policy.defaultProfile),
      config.defaultProfile,
    ].find((id) => id && availableProfiles.includes(id)) || availableProfiles[0]!;
  return Object.freeze({
    locale,
    profile,
    direction: locales.get(locale)!.direction,
    localeChain: buildLocaleChain(locale, config.fallbackLocale, [...locales.keys()]),
    availableLocales: Object.freeze(availableLocales),
    availableProfiles: Object.freeze(availableProfiles),
  });
}

/** Engine options, not an engine singleton. Pass into a new i18next instance in the public runtime. */
export function createI18nextOptions(selection: UiLanguageSelection, namespaces: readonly string[]) {
  return {
    lng: selection.locale,
    fallbackLng: selection.localeChain.filter((id) => id !== selection.locale),
    supportedLngs: [...selection.localeChain],
    ns: [...namespaces],
    defaultNS: "common",
    load: "currentOnly" as const,
    returnNull: false as const,
    returnEmptyString: false,
    interpolation: { escapeValue: false },
  };
}

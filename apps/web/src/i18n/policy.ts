import {
  createEditorI18n,
  defaultLocales,
  dutchLocale,
  type EditorI18nOptions,
  type UiI18nConfig,
} from "@manifest-editor/i18n/core";

import { webUiResources } from "./resources";

export const webRequiredNamespaces = Object.freeze([
  "web",
  "common",
  "components",
  "shell",
  "editor-api",
  "editors",
  "creators",
  "projects",
  "ui",
]);

/** The runtime coverage report excludes English fallback for a Dutch selection. */
export function webUiCoverage(
  locale: string,
  profile: string,
  requiredNamespaces: readonly string[],
  resources: EditorI18nOptions = webUiResources
) {
  return createEditorI18n({
    ...resources,
    locales: registeredLocales,
    locale,
    profile,
    requiredNamespaces,
  }).getSnapshot().coverage;
}

export const UI_PREFERENCES_COOKIE = "manifest-editor-ui";
const registeredLocales = Object.freeze([...defaultLocales, dutchLocale].map((locale) => Object.freeze({ ...locale })));
const registeredProfiles = Object.freeze(["standard", "plain"]);

export interface WebUiPreferences {
  readonly locale?: string;
  readonly profile?: string;
}
export interface WebUiPolicy {
  readonly locales: typeof registeredLocales;
  readonly config: UiI18nConfig;
  readonly requiredNamespaces: readonly string[];
}

export function createWebUiPolicy(
  options: {
    availableLocales?: readonly string[];
    availableProfiles?: readonly string[];
    defaultLocale?: string;
    defaultProfile?: string;
    requiredNamespaces?: readonly string[];
  } = {}
): WebUiPolicy {
  let availableLocales = [...new Set(options.availableLocales ?? registeredLocales.map((item) => item.id))];
  const availableProfiles = [...new Set(options.availableProfiles ?? registeredProfiles)];
  if (!availableLocales.length || availableLocales.some((id) => !registeredLocales.some((locale) => locale.id === id)))
    throw new TypeError("Web UI locales must select registered language catalogs");
  if (!availableProfiles.length || availableProfiles.some((id) => !registeredProfiles.includes(id)))
    throw new TypeError("Web wording profiles must select registered profiles");
  const requiredNamespaces = Object.freeze([
    ...new Set([...webRequiredNamespaces, ...(options.requiredNamespaces ?? [])]),
  ]);
  // The picker exposes independent axes: every exposed locale must cover every exposed profile.
  availableLocales = availableLocales.filter((locale) =>
    availableProfiles.every((profile) => webUiCoverage(locale, profile, requiredNamespaces).complete)
  );
  if (!availableLocales.length) throw new TypeError("No web UI locale covers the required namespaces");
  const defaultLocale = options.defaultLocale ?? (availableLocales.includes("en-GB") ? "en-GB" : availableLocales[0]!);
  const defaultProfile =
    options.defaultProfile ?? (availableProfiles.includes("standard") ? "standard" : availableProfiles[0]!);
  if (!availableLocales.includes(defaultLocale) || !availableProfiles.includes(defaultProfile))
    throw new TypeError("Default web interface settings must be available");
  return Object.freeze({
    locales: registeredLocales,
    requiredNamespaces,
    config: Object.freeze({
      availableLocales: Object.freeze(availableLocales),
      availableProfiles: Object.freeze(availableProfiles),
      defaultLocale,
      defaultProfile,
      fallbackLocale: "en-GB",
    }),
  });
}

const csv = (value: string | undefined) =>
  value === undefined
    ? undefined
    : value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
export const webUiPolicy = createWebUiPolicy({
  availableLocales: csv(process.env.NEXT_PUBLIC_MANIFEST_EDITOR_UI_LOCALES),
  availableProfiles: csv(process.env.NEXT_PUBLIC_MANIFEST_EDITOR_UI_PROFILES),
  requiredNamespaces: csv(process.env.NEXT_PUBLIC_MANIFEST_EDITOR_UI_REQUIRED_NAMESPACES),
  defaultLocale: process.env.NEXT_PUBLIC_MANIFEST_EDITOR_UI_DEFAULT_LOCALE,
  defaultProfile: process.env.NEXT_PUBLIC_MANIFEST_EDITOR_UI_DEFAULT_PROFILE,
});

/** UI-only versioned preference. Never read or reinterpret project/content-language settings. */
export function parseWebUiPreferences(value: string | undefined, policy: WebUiPolicy = webUiPolicy): WebUiPreferences {
  if (!value) return {};
  try {
    const data: unknown = JSON.parse(decodeURIComponent(value));
    if (!data || typeof data !== "object" || Array.isArray(data) || !("version" in data) || data.version !== 1)
      return {};
    const preferences = data as Record<string, unknown>;
    return {
      ...(typeof preferences.locale === "string" && policy.config.availableLocales.includes(preferences.locale)
        ? { locale: preferences.locale }
        : {}),
      ...(typeof preferences.profile === "string" && policy.config.availableProfiles.includes(preferences.profile)
        ? { profile: preferences.profile }
        : {}),
    };
  } catch {
    return {};
  }
}

export function webUiSelection(preferences: WebUiPreferences, policy: WebUiPolicy = webUiPolicy) {
  return {
    locale: policy.config.availableLocales.includes(preferences.locale ?? "")
      ? preferences.locale!
      : policy.config.defaultLocale,
    profile: policy.config.availableProfiles.includes(preferences.profile ?? "")
      ? preferences.profile!
      : policy.config.defaultProfile,
  };
}

export function serializeWebUiPreferences(preferences: WebUiPreferences, secure: boolean): string {
  return `${UI_PREFERENCES_COOKIE}=${encodeURIComponent(JSON.stringify({ version: 1, ...preferences }))}; Path=/; Max-Age=31536000; SameSite=Lax${secure ? "; Secure" : ""}`;
}

import type { Config } from "@manifest-editor/shell";
import { isSupportedM2M100Language } from "./languages";
import type {
  TranslationContentFilters,
  TranslationPluginSettings,
  TranslationRunOptions,
  TranslationRuntimePreference,
} from "./types";

const defaultSourceLanguage = "en";
const defaultTargetLanguage = "nl";

export const defaultTranslationContentFilters: TranslationContentFilters = {
  annotationBodies: true,
  canvasLabels: true,
};

export function getDefaultRunOptions(
  config?: Partial<Config> | null,
  settings: TranslationPluginSettings = {},
): TranslationRunOptions {
  const availableLanguages = getSupportedAvailableLanguages(config);
  const sourceLanguage =
    resolveSupportedLanguage(settings.defaultSourceLanguage) ||
    resolveSupportedLanguage(config?.i18n?.defaultLanguage) ||
    availableLanguages[0] ||
    defaultSourceLanguage;
  const targetLanguage =
    resolveSupportedLanguage(settings.defaultTargetLanguage, sourceLanguage) ||
    availableLanguages.find((language) => language !== sourceLanguage) ||
    (sourceLanguage === defaultTargetLanguage
      ? defaultSourceLanguage
      : defaultTargetLanguage);

  return normaliseRunOptions({
    sourceLanguage,
    targetLanguage,
    runtime: settings.runtimePreference,
    writePolicy: "fill-missing",
  });
}

export function normaliseRunOptions(
  options: Partial<TranslationRunOptions> = {},
): TranslationRunOptions {
  const sourceLanguage =
    resolveSupportedLanguage(options.sourceLanguage) || defaultSourceLanguage;
  const targetLanguage =
    resolveSupportedLanguage(options.targetLanguage, sourceLanguage) ||
    (sourceLanguage === defaultTargetLanguage
      ? defaultSourceLanguage
      : defaultTargetLanguage);

  return {
    sourceLanguage,
    targetLanguage,
    runtime: normaliseRuntimePreference(options.runtime),
    writePolicy: "fill-missing",
    contentFilters: normaliseContentFilters(options.contentFilters),
  };
}

export function getSupportedAvailableLanguages(
  config?: Partial<Config> | null,
): string[] {
  const configured = config?.i18n?.availableLanguages || [];
  const supported: string[] = [];

  for (const language of configured) {
    const resolved = resolveSupportedLanguage(language);
    if (resolved && !supported.includes(resolved)) {
      supported.push(resolved);
    }
  }

  return supported;
}

export function resolveSupportedLanguage(
  language: unknown,
  disallow?: string,
): string | null {
  if (typeof language !== "string") {
    return null;
  }

  const normalised = normaliseLanguageCode(language);
  if (!normalised || normalised === disallow) {
    return null;
  }

  if (isSupportedM2M100Language(normalised)) {
    return normalised;
  }

  const baseLanguage = normalised.split("-")[0] || "";
  if (
    baseLanguage !== normalised &&
    baseLanguage !== disallow &&
    isSupportedM2M100Language(baseLanguage)
  ) {
    return baseLanguage;
  }

  return null;
}

export function normaliseLanguageCode(language: string) {
  return language.trim().replace(/_/g, "-").toLowerCase();
}

function normaliseRuntimePreference(
  value: unknown,
): TranslationRuntimePreference {
  return value === "webgpu" || value === "wasm" || value === "auto"
    ? value
    : "auto";
}

function normaliseContentFilters(value: unknown): TranslationContentFilters {
  const filters =
    value && typeof value === "object"
      ? (value as Partial<TranslationContentFilters>)
      : {};

  return {
    annotationBodies:
      typeof filters.annotationBodies === "boolean"
        ? filters.annotationBodies
        : defaultTranslationContentFilters.annotationBodies,
    canvasLabels:
      typeof filters.canvasLabels === "boolean"
        ? filters.canvasLabels
        : defaultTranslationContentFilters.canvasLabels,
  };
}
